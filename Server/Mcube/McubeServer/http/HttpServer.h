#ifndef HTTP_HTTPSSERVER_H
#define HTTP_HTTPSSERVER_H

#include <Tufao/HttpServer>
#include <QSslCertificate>
#include <memory>
#include "common/SslUtil/KeyPair.h"

class QSslSocket;
class CRLRepository;
class DeviceRepository;
class AuthorisedCertificateRepository;
class HttpThread;
class HttpController;
class HttpUpgrader;

struct HttpsServer : Tufao::HttpServer
{
    Q_OBJECT
public:
    HttpsServer(const QSslCertificate & serverCertificate, const QSslCertificate &caCertificate, const SslUtil::KeyPair & serverKeyPair, const SslUtil::KeyPair & caKeyPair,
                std::shared_ptr<DeviceRepository> devices, std::shared_ptr<CRLRepository> crls, HttpController *handler, HttpUpgrader * upgrader);
    ~HttpsServer();

protected:
    void incomingConnection(qintptr socketDescriptor) override; //Determains which socket will do the validation based on infomation contained in the socket

private Q_SLOTS:
    //void onEncrypted(QSslSocket * socket);

private:
    QSslCertificate serverCertificate_;
    QSslCertificate caCertificate_;
    SslUtil::KeyPair serverKeyPair_;
    SslUtil::KeyPair caKeyPair_;

    int workerBalancer_;
    int tolerence_;
    QList<QSharedPointer<HttpThread>> workers_; //TODO load balancing logic
    QList<QSharedPointer<QThread>> threads_;

    std::shared_ptr<DeviceRepository> devices_;
    std::shared_ptr<CRLRepository> crls_;
};

#endif // HTTPSSERVER_H
