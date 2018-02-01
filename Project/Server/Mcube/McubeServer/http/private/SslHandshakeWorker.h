#ifndef HTTP_PRIVATE_SSLHANDSHAKEWORKER_H
#define HTTP_PRIVATE_SSLHANDSHAKEWORKER_H

#include <QThread>
#include <QSslSocket>
#include <QSslKey>
#include <QQueue>
#include <QPointer>

#include "Common/Core/IO/helpers/ThroughputModerator.h"

Q_DECLARE_METATYPE(qintptr)

class SslHandshakeWorker : public QObject
{
    Q_OBJECT

public:
    SslHandshakeWorker(const QSslCertificate & ca,
                       const QSslCertificate & serverCertificate,
                       const QSslKey & privateKey,
                       QThread & homeThread);
    ~SslHandshakeWorker();

signals:
    void socketReady(QSslSocket * socket);

public slots:
    void initialize();

    void takeSocket(qintptr socketDescriptor);

private slots:
    void processQueuedSockets();

private:
    QSslCertificate ca_;
    QSslCertificate serverCertificate_;
    QSslKey privateKey_;

    QThread & homeThread_;

    int currentHandshakes_;

    Core::IO::ThroughputModerator moderator_;

    QQueue< QPointer< QSslSocket > > queuedSockets_;
};

#endif // HTTP_PRIVATE_SSLHANDSHAKEWORKER_H
