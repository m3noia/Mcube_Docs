#ifndef HTTP_HTTPTHREAD_H
#define HTTP_HTTPTHREAD_H
#include <QSslCertificate>
#include <QSslSocket>
#include <QSslKey>
#include <QQueue>
#include <mutex>
#include <QSemaphore>
#include <QPointer>
#include <Tufao/HttpServerRequest>
#include <Tufao/HttpServerResponse>
#include "Common/Core/Exception/Exception.h"

#include "private/SslHandshakeThread.h"

class HttpController;
class HttpUpgrader;

class HttpThread : public QObject //TODO better system for allicating connections to indivitual threads and correctly proiziting people across all waiting lists between threads
{
    Q_OBJECT
public:
    abException(SocketDescriptorNotSet);
    HttpThread(const QSslCertificate & caCertificate, const QSslCertificate & serverCertificate, const QSslKey privateKey, HttpController *handler, HttpUpgrader *upgrader);
    ~HttpThread() = default;

    int currentLoad();
    void newConnection(qintptr socketDescriptor);

signals:
    void connectionReady(qintptr socketDescriptor);
    void updateReady(Tufao::HttpServerRequest &request, Tufao::HttpServerResponse &response);
    void handshakeReady();

private slots:
    void addConnection(qintptr socketDescriptor);
    void onSocketDisconnection();
    void onRequestReady();
    void onUpgradeReady();

    void onSocketHandshakeComplete(QAbstractSocket * socket);

private:
    void prepareRequest(QAbstractSocket * socket);

    std::mutex mutex_;
    std::atomic_int connections_;

    QSslCertificate ca_;
    QSslCertificate serverCertificate_;
    QSslKey key_;

    HttpController * handler_;
    HttpUpgrader * upgrader_;

    int nextSslHandshakeThreadIndex_;
    QList< QSharedPointer< SslHandshakeThread > > sslHandshakeThreads_;
};

#endif // HTTP_HTTPTHREAD_H
