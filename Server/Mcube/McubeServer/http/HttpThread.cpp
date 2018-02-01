#include "HttpThread.h"
#include <Tufao/Headers>
#include <QThread>
#include <QHostAddress>
#include "http/HttpController.h"
#include "http/HttpUpgrader.h"

#include "helpers/EventCounter.h"

HttpThread::HttpThread(const QSslCertificate &caCertificate, const QSslCertificate &serverCertificate, const QSslKey privateKey, HttpController * handler, HttpUpgrader * upgrader)
    : connections_(0), ca_(caCertificate), serverCertificate_(serverCertificate), key_(privateKey), handler_(handler), upgrader_(upgrader), nextSslHandshakeThreadIndex_(0)
{
    qRegisterMetaType< qintptr >("qintptr");

    connect(this, &HttpThread::connectionReady, this, &HttpThread::addConnection, Qt::QueuedConnection);

    auto eventCounter = new EventCounter(this);

    installEventFilter(eventCounter);
}

void HttpThread::addConnection(qintptr socketDescriptor)
{
    while (sslHandshakeThreads_.size() < QThread::idealThreadCount())
    {
        QSharedPointer< SslHandshakeThread > handshakeThread(new SslHandshakeThread(ca_,serverCertificate_,key_));

        connect(handshakeThread.data(),
                &SslHandshakeThread::socketReady,
                this,
                &HttpThread::onSocketHandshakeComplete);

        sslHandshakeThreads_.append(handshakeThread);
    }

    sslHandshakeThreads_[nextSslHandshakeThreadIndex_]->takeSocket(socketDescriptor);

    if (++nextSslHandshakeThreadIndex_ >= sslHandshakeThreads_.size())
        nextSslHandshakeThreadIndex_ = 0;
}


int HttpThread::currentLoad()
{
    return connections_;
}

void HttpThread::newConnection(qintptr socketDescriptor)
{
    emit connectionReady(socketDescriptor);
}

void HttpThread::onSocketDisconnection()
{
    connections_--;
}

void HttpThread::onRequestReady()
{
    Tufao::HttpServerRequest *request = qobject_cast<Tufao::HttpServerRequest *>(sender());

    QAbstractSocket &socket = request->socket();
    Tufao::HttpServerResponse *response
            = new Tufao::HttpServerResponse(socket, request->responseOptions(), this);

    connect(&socket,&QAbstractSocket::disconnected,response,&QObject::deleteLater);

    connect(response,&Tufao::HttpServerResponse::finished,request,&Tufao::HttpServerRequest::resume);
    connect(response,&Tufao::HttpServerResponse::finished,response,&Tufao::HttpServerResponse::deleteLater);

    if (request->headers().contains("Expect", "100-continue"))
        response->writeContinue();

    handler_->handleRequest(*request, *response);
}

void HttpThread::onUpgradeReady()
{
    Tufao::HttpServerRequest *request = qobject_cast<Tufao::HttpServerRequest *>(sender());
    Q_ASSERT(request);

    upgrader_->handleUpgrade(*request, request->readBody());
    delete request;
}

void HttpThread::onSocketHandshakeComplete(QAbstractSocket * socket)
{
    prepareRequest(socket);

    connect(socket,&QAbstractSocket::disconnected,socket,&QObject::deleteLater);
    QObject::connect(socket,&QAbstractSocket::disconnected,this,&HttpThread::onSocketDisconnection,Qt::DirectConnection);
    connections_++;
}

void HttpThread::prepareRequest(QAbstractSocket *socket)
{
    Tufao::HttpServerRequest * handle = new Tufao::HttpServerRequest(*socket, this);

    connect(handle,&Tufao::HttpServerRequest::ready,this,&HttpThread::onRequestReady,Qt::DirectConnection);
    connect(handle,&Tufao::HttpServerRequest::upgrade,this,&HttpThread::onUpgradeReady,Qt::DirectConnection);
    connect(socket,&QAbstractSocket::disconnected,handle,&Tufao::HttpServerRequest::deleteLater);

    handle->setProperty("ip", socket->peerAddress().toString()); // socket->peerAddress().toString() claims to follow RFC5952, does not :/

    handle->setTimeout(30000);
}
