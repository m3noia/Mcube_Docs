#ifndef HTTP_PRIVATE_ASYNCFILEREADER_H
#define HTTP_PRIVATE_ASYNCFILEREADER_H

#include <QObject>
#include <QByteArray>
#include <QFile>
#include <QMimeDatabase>

class AsyncFileReader final : public QObject
{
    Q_OBJECT

public:
    AsyncFileReader(const QString & path);
    ~AsyncFileReader();

    // this must only be called once the object has been moved to its home thread...
    void requestChunk(qint64 maxChunkSize);
    void handleFailure(const QString & reason);
    QString contentType() const;

signals:
    void chunkRead(const QByteArray & chunk); // need file size or anything in here?
    void finished(); // all bytesRead signals have been sent once you get this...
    void failed(const QString & errorDescription);

private slots:
    void onChunkRequested(qint64 maxChunkSize);
    void onHandleFailure(const QString & reason);

private:
    void fail(const QString & reason);

private:
    QString path_;

    QFile file_;
    QString contentType_;

    bool failed_; // this is part of a whole bunch of shit phil made me check in and it was his idea

    static QMimeDatabase mimeDb_;
};

#endif // HTTP_PRIVATE_ASYNCFILEREADER_H
