#include "AsyncFileReader.h"

QMimeDatabase AsyncFileReader::mimeDb_;

AsyncFileReader::AsyncFileReader(const QString & path) :
    path_(path),
    contentType_(mimeDb_.mimeTypeForFile(path).name()),
    failed_(false)
{
}

AsyncFileReader::~AsyncFileReader()
{
}

void AsyncFileReader::requestChunk(qint64 maxChunkSize)
{
    QMetaObject::invokeMethod(this,"onChunkRequested",Qt::QueuedConnection,Q_ARG(qint64,maxChunkSize));
}

void AsyncFileReader::handleFailure(const QString & reason)
{
    QMetaObject::invokeMethod(this,"onHandleFailure",Qt::QueuedConnection,Q_ARG(const QString &,reason));
}

QString AsyncFileReader::contentType() const
{
    return contentType_;
}

void AsyncFileReader::onChunkRequested(qint64 maxChunkSize)
{
    if (file_.isOpen() && file_.atEnd())
    {
        // we're already open, so if it was a zero-length file we've already sent a finished()
        // so this should only happen when we've been asked for another chunk when we're already done
        // so we should be ok here...?
        // don't have to emit finished here either i guess

        return;
    }

    if (!file_.isOpen())
    {
        // open it; this is probably the first chunk request...
        file_.setFileName(path_);

        if (!file_.open(QIODevice::ReadOnly))
        {
            fail(QString("failed to open file: %1").arg(file_.errorString()));

            return;
        }
    }

    auto chunk = file_.read(maxChunkSize);

    if (file_.error() != QFileDevice::NoError)
    {
        fail(QString("read failed with: %1").arg(file_.errorString()));

        return;
    }

    if (!chunk.isEmpty())
        emit chunkRead(chunk);

    if (file_.atEnd()) {
        emit finished();
    }
}

void AsyncFileReader::onHandleFailure(const QString & reason)
{
    fail(reason);
}

void AsyncFileReader::fail(const QString & reason)
{
    if (!failed_)
    {
        failed_ = true;

        emit failed(QString("read failed with: %1").arg(reason));
    }
}
