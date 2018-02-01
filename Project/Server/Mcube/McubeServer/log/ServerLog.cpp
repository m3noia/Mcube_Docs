#include "ServerLog.h"
#include "private/Defines.h"

void ServerLog::init()
{
    logThreadPool_.setMaxThreadCount(1);

    setLogFile();
}
void ServerLog::setLogFile()
{
    setGenericFile(logFile_, SERVER_LOG_FILE);
}
void ServerLog::setGenericFile(QFile & file, const QString &nameTemplate)
{
    QDir dir(ROOT_LOG_PATH);
    QFileInfo head(dir.absoluteFilePath(nameTemplate + QString(".log")));
    file.setFileName(head.absoluteFilePath());
    if( head.size() > ( ServerDebugSettings().logFileSizeMBs() * 1000000) ) {
        shuffleFiles(dir, nameTemplate);
        if(!file.open(QFile::OpenModeFlag::WriteOnly | QFile::OpenModeFlag::Append | QIODevice::Unbuffered))
            qDebug() << __PRETTY_FUNCTION__ << file.error();
    }
    else {
        if(!file.open(QFile::OpenModeFlag::WriteOnly | QFile::OpenModeFlag::Append | QIODevice::Unbuffered))
            qDebug() << __PRETTY_FUNCTION__ << file.error();
    }
}

void ServerLog::writeSetupLog(const QString &action)
{
    QByteArray logEntry = formatSystemLogEntry(QString("STARTUP \"%1\"").arg(action)).toLatin1();
    sysWrite(logEntry);
}

void ServerLog::writeSetupError(const QString & error)
{
    QByteArray logEntry = formatSystemLogEntry(QString("STARTUP-ERROR \"%1\"").arg(error)).toLatin1();
    sysWrite(logEntry);
}

QString ServerLog::formatSystemLogEntry(const QString & content)
{
    return "[" + currentDateTime() + "] " + content + "\r\n";
}
