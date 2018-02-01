#ifndef SERVERLOG_H
#define SERVERLOG_H
#include <mutex>

#include <QString>
#include <QFile>
#include <QDir>
#include <QDir>
#include <QThreadPool>
#include <QSqlError>

class ServerLog
{
public:
    static void init();

private:
    ServerLog() = delete;

    static void setLogFile();

    static QFile logFile_;

    static QThreadPool logThreadPool_;
    static void setGenericFile(QFile & file, const QString & nameTemplate);

    static void writeSetupLog(const QString & action);
    static void writeSetupError(const QString & error);

    static QString formatSystemLogEntry(const QString &content);

};

#endif // SERVERLOG_H
