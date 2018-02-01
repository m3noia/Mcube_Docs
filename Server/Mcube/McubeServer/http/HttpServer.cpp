#include "HttpServer.h"
#include <future>
#include <QSslSocket>
#include <QUuid>
#include <QThread>
#include <QSslCertificate>
#include <QAbstractEventDispatcher>
#include <Tufao/WebSocket>
#include <Tufao/HttpServerRequest>
#include <Tufao/HttpServerResponse>
#include "Common/SslUtil/OIDs.h"
#include "HttpThread.h"
#include "components/ServerLogWriter.h"
#include "components/ServerDebugSettings.h"
#include "repository/certificates/CRLRepository.h"
#include "repository/certificates/AuthorisedCertificateRepository.h"
#include "Common/SslUtil/Certificate.h"
#include "Common/Core/Generics/Helpers/StringConversion.h"
#include "repository/certificates/CRLRepository.h"
#include "repository/devices/DeviceRepository.h"

HttpsServer::HttpsServer(const QSslCertificate & serverCertificate, const QSslCertificate & caCertificate, const SslUtil::KeyPair & serverKeyPair, const SslUtil::KeyPair &caKeyPair, std::shared_ptr<DeviceRepository> devices, std::shared_ptr<CRLRepository> crls, HttpController * handler, HttpUpgrader * upgrader) :
    Tufao::HttpServer(),
    serverCertificate_(serverCertificate),
    caCertificate_(caCertificate),
    serverKeyPair_(serverKeyPair),
    caKeyPair_(caKeyPair),
    workerBalancer_(0),
    devices_(devices),
    crls_(crls)
{
    this->setUpgradeHandler(this->defaultUpgradeHandler());
    auto multiplier = ServerDebugSettings().getThreadMultiplier();
    if(multiplier <= 0)
        multiplier = 1;
    auto threadCount = QThread::idealThreadCount() * multiplier;
    threadCount = 1;
    workers_.reserve(threadCount);
    do {
        QSharedPointer<HttpThread> worker(new HttpThread(caCertificate_, serverCertificate_, serverKeyPair_.privateKey(), handler, upgrader));
        QSharedPointer<QThread> thread(new QThread());
        thread->setObjectName("ABHttpThread");
        threads_.push_back(thread);
        worker->moveToThread(thread.data());
        thread->start();
        workers_.push_back(worker);
    } while(threadCount > workers_.size());
}

HttpsServer::~HttpsServer()
{
    ServerLogWriter::writeInternalSystemErrorLog(__PRETTY_FUNCTION__, "HttpServer shutting down.");
    for(auto iter = workers_.begin(); iter != workers_.end(); ++iter) {
        (*iter)->deleteLater();
    }
    for(auto iter = threads_.begin(); iter != threads_.end(); ++iter) {
        (*iter)->exit();
        (*iter)->wait();
    }
    ServerLogWriter::writeInternalSystemErrorLog(__PRETTY_FUNCTION__, "HttpServer has shut down.");
}

void HttpsServer::HttpsServer::incomingConnection(qintptr socketDescriptor)
{
    workers_[(workerBalancer_++) % workers_.size()]->newConnection(socketDescriptor);
}
