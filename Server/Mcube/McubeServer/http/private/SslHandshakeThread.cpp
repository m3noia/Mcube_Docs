#include "SslHandshakeThread.h"

#include "SslHandshakeWorker.h"

SslHandshakeThread::SslHandshakeThread(const QSslCertificate & ca, const QSslCertificate & serverCertificate, const QSslKey & privateKey) :
    worker_(new SslHandshakeWorker(ca,serverCertificate,privateKey,*QThread::currentThread()))
{
    worker_->moveToThread(&thread_);

    connect(worker_,&SslHandshakeWorker::socketReady,this,&SslHandshakeThread::socketReady);

    thread_.setObjectName("ABSslHandshakeThread");

    thread_.start();

    QMetaObject::invokeMethod(worker_,"initialize",Qt::QueuedConnection);
}

SslHandshakeThread::~SslHandshakeThread()
{
    worker_->deleteLater();

    worker_ = nullptr;

    thread_.quit();

    thread_.wait();
}

void SslHandshakeThread::takeSocket(qintptr socketDescriptor)
{
    QMetaObject::invokeMethod(worker_,"takeSocket",Qt::QueuedConnection,Q_ARG(qintptr,socketDescriptor));
}
