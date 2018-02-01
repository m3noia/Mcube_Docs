#ifndef HTTP_PRIVATE_SSLHANDSHAKETHREAD_H
#define HTTP_PRIVATE_SSLHANDSHAKETHREAD_H

#include <QObject>
#include <QThread>
#include <QSslSocket>

#include "SslHandshakeWorker.h"

class SslHandshakeThread : public QObject
{
    Q_OBJECT

public:
    SslHandshakeThread(const QSslCertificate & ca, const QSslCertificate & serverCertificate, const QSslKey & privateKey);
    ~SslHandshakeThread();

    void takeSocket(qintptr socketDescriptor);

signals:
    void socketReady(QSslSocket * socket);

private:
    QThread thread_;

    SslHandshakeWorker * worker_;
};

#endif // HTTP_PRIVATE_SSLHANDSHAKETHREAD_H
