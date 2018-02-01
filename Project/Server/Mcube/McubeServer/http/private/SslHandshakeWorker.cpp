#include <unistd.h>

#include <QHostAddress>
#include <QTimer>

#include "SslHandshakeWorker.h"

#include "components/ServerLogWriter.h"

#define WARP_FACTOR 250.0

SslHandshakeWorker::SslHandshakeWorker(const QSslCertificate & ca,
                                       const QSslCertificate & serverCertificate,
                                       const QSslKey & privateKey,
                                       QThread & homeThread) :
    ca_(ca),
    serverCertificate_(serverCertificate),
    privateKey_(privateKey),
    homeThread_(homeThread),
    currentHandshakes_(0),
    moderator_(WARP_FACTOR)
{
}

SslHandshakeWorker::~SslHandshakeWorker()
{
    while (!queuedSockets_.isEmpty())
    {
        auto socket = queuedSockets_.dequeue();

        if (socket)
            socket->deleteLater();
    }
}

void SslHandshakeWorker::initialize()
{
    auto timer = new QTimer(this);

    connect(timer,&QTimer::timeout,this,&SslHandshakeWorker::processQueuedSockets);

    timer->start(1000);
}

void SslHandshakeWorker::takeSocket(qintptr socketDescriptor)
{
    QSslSocket * socket = new QSslSocket();

    socket->setProtocol(QSsl::SecureProtocols);
    socket->setLocalCertificate(serverCertificate_);
    socket->setPrivateKey(privateKey_);

    if (socket->setSocketDescriptor(socketDescriptor))
    {
        socket->setCaCertificates({ca_});
        //socket->setSocketOption(QAbstractSocket::KeepAliveOption, true );
        //socket->setSocketOption(QAbstractSocket::LowDelayOption,true);

        QObject::connect(socket,&QSslSocket::disconnected,socket,&QObject::deleteLater);

        queuedSockets_.enqueue(socket);

        processQueuedSockets();
    } else
    {
        socket->deleteLater();

        ::close(socketDescriptor);
    }
}

void SslHandshakeWorker::processQueuedSockets()
{
    //qDebug() << currentHandshakes_ << "/ q:" << queuedSockets_.size() << "/ c:" << moderator_.credit();

    moderator_.removeExcessCredit(WARP_FACTOR);

    while (!queuedSockets_.isEmpty() && moderator_.credit() > 1.0)
    {
        auto socket = queuedSockets_.dequeue();

        if (!socket)
        {
            ServerLogWriter::writeWarningLog(__PRETTY_FUNCTION__, "dropping one...");
            qDebug() << "dropping one...";

            continue;
        }

        QObject::disconnect(socket,&QSslSocket::disconnected,socket,&QObject::deleteLater);

        socket->setProperty("handshaking",true);

        ++currentHandshakes_;
        ServerLogWriter::writeHandshakeRequest(socket->peerAddress().toString(), queuedSockets_.size(),  currentHandshakes_, QString::number( reinterpret_cast<unsigned long>(QThread::currentThread())), moderator_.credit(), true);

        moderator_.spend(1.0);

        //qDebug() << "handshaking" << moderator_.credit() << "-" << queuedSockets_.size() << "waiting" << "-" << currentHandshakes_ << "ongoing" << socket->peerAddress().toString();

        connect(socket,&QSslSocket::encrypted,this,[this,socket]() {
            if (socket)
            {
                disconnect(socket,nullptr,this,nullptr);
                disconnect(socket,&QSslSocket::disconnected,socket,&QObject::deleteLater);

                if (socket->property("handshaking").toBool())
                {
                    --currentHandshakes_;
                    ServerLogWriter::writeHandshakeRequest(socket->peerAddress().toString(), queuedSockets_.size(),  currentHandshakes_, QString::number( reinterpret_cast<unsigned long>(QThread::currentThread())), moderator_.credit(), false);

                    socket->setProperty("handshaking",QVariant());
                } else
                {
                    qDebug() << "ENCRYPTED NOT HANDSHAKING";
                    ServerLogWriter::writeWarningLog(__PRETTY_FUNCTION__, "ENCRYPTED NOT HANDSHAKING");
                }

                socket->moveToThread(&homeThread_);

                emit socketReady(socket.data());
            } else
            {
                ServerLogWriter::writeWarningLog(__PRETTY_FUNCTION__, "ENCRYPTED NULL");
                qDebug() << "ENCRYPTED NULL";
            }

            processQueuedSockets();
        },Qt::QueuedConnection);

        QObject::connect(socket,&QSslSocket::disconnected,this,[this,socket]() {
            if (socket)
            {
                disconnect(socket,nullptr,this,nullptr);
                disconnect(socket,&QSslSocket::disconnected,socket,&QObject::deleteLater);

                if (socket->property("handshaking").toBool())
                {
                    --currentHandshakes_;
                    ServerLogWriter::writeHandshakeRequest(socket->peerAddress().toString(), queuedSockets_.size(),  currentHandshakes_, QString::number( reinterpret_cast<unsigned long>(QThread::currentThread())), moderator_.credit(), false);

                    socket->setProperty("handshaking",QVariant());
                } else
                {
                    ServerLogWriter::writeWarningLog(__PRETTY_FUNCTION__, "DISCONNECTED NOT HANDSHAKING");
                    qDebug() << "DISCONNECTED NOT HANDSHAKING";
                }

                socket->deleteLater();
            } else
            {
                ServerLogWriter::writeWarningLog(__PRETTY_FUNCTION__, "DISCONNECTED NULL");
                qDebug() << "DISCONNECTED NULL";
            }

            processQueuedSockets();
        },Qt::QueuedConnection);

        socket->startServerEncryption();
    }

    /*while (!queuedSockets_.isEmpty())
    {
        auto socket = queuedSockets_.dequeue();

        socket->deleteLater();
    }*/
}
