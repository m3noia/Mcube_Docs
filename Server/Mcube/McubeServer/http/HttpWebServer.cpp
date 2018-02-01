#include <QCoreApplication>
#include <QRegularExpression>
#include <QStandardPaths>
#include <QPointer>
#include <QFile>
#include <Tufao/HttpServerRequest>
#include "private/Defines.h"
#include "HttpWebServer.h"
#include "http/HttpRequest.h"
#include "http/HttpResponse.h"
#include <QDebug>

HttpWebServer::HttpWebServer() : rootHtmlDir_(deduceHtmlDirectory()), rootUpgradeDir_(deduceUpgradeDirectory()), rootInstallerDir_(deduceInstallerDirectory()), fileServer_(rootHtmlDir_), updateFileServer_(rootUpgradeDir_), installerFileServer_(rootInstallerDir_)
{
    fileIOThread_.setObjectName("ABFileIOThread");

    fileIOThread_.start();
}

HttpWebServer::~HttpWebServer()
{
    fileIOThread_.quit();

    fileIOThread_.wait(2000); // .... ....Tim....
}

void HttpWebServer::handout(HttpRequest *request, HttpResponse *response, const QString &webRoot, const QString &path)
{

    QString temp = path;

    temp.remove(QRegularExpression("[^a-zA-Z0-9-/._+]"));
    temp.remove(QRegularExpression("\\.\\.")); //Second call required to prevent '/.$./' to turning into '/../'
    if(temp != path) {
        response->badRequest(Protocol::ServerError::WEB_UNACCEPTABLE_PATH);
        return;
    }

    QString newPath = path;

    if (newPath.endsWith("/") && QDir(webRoot + newPath).exists())
    {
         if (QFileInfo(webRoot + newPath + "index.html").exists())
             newPath.append("index.html");
         else
         {
             response->setContentTypeHtml();
             response->forbidden(Protocol::ServerError::WEB_INVALID_INDEX);
             return;
         }
    }

    QFileInfo file(webRoot + newPath);

    if(file.exists())
    {
        if (file.isFile())
        {
            ServerLogWriter::writeAccessLog(request->ipAddress(), "", QString::fromLatin1(request->method()), request->url().toString(), (int)Tufao::HttpResponseStatus::OK, file.size());

            serveFile(request,response,QString(webRoot + newPath));
        }
        else
        {
            response->tempRedirect(newPath + "/");
        }
    }
    else
    {
        response->notFound(Protocol::ServerError::WEB_FILE_NOT_FOUND);
    }
}

void HttpWebServer::handoutWebPage(HttpRequest *request, HttpResponse *response, const QString & path) //clean up. Error if content is removed.
{
    handout(request, response, rootHtmlDir_, path);
}

void HttpWebServer::handoutUpgradeFile(HttpRequest *request, HttpResponse *response, const QString & path)
{
    handout(request, response, rootUpgradeDir_, path);
}

void HttpWebServer::handoutInstallerFile(HttpRequest *request, HttpResponse *response, const QString & path)
{
    handout(request, response, rootInstallerDir_, path);
}

void HttpWebServer::serveFile(HttpRequest * request, HttpResponse * response, const QString & path)
{
    // NOTE: MUST BE ABLE TO OPEN THIS THX
    // this is all pretty ugly...
    response->response().writeHead(Tufao::HttpResponseStatus::OK);
    auto reader = new AsyncFileReader(path);
    response->setContentTypeCustom(reader->contentType().toUtf8());

    reader->moveToThread(&fileIOThread_);

    fileReaders_ += reader;

    QPointer< AsyncFileReader > safeReader(reader);

    connect(&request->request(),&Tufao::HttpServerRequest::close,reader,[this,safeReader]() {
        if (safeReader)
        {
            if (fileReaders_.contains(safeReader))
                fileReaders_ -= safeReader;

            safeReader->deleteLater();
        }
    });

    connect(reader,&AsyncFileReader::chunkRead,response,[this,response,safeReader,path](const QByteArray & chunk) {
        try
        {
            response->response() << chunk;
            response->response().flush();

            if (safeReader)
                safeReader->requestChunk(65536);
        }

        catch (const std::exception & ex)
        {
            // wow bad
            ServerLogWriter::writeErrorLog(QString("async file chunk read failed for %1 due to: %2").arg(path, ex.what()));

            if (safeReader)
                safeReader->handleFailure(ex.what());
        }
    },Qt::QueuedConnection);

    connect(reader,&AsyncFileReader::finished,response,[this,response,safeReader,path]() {
        try
        {
            response->response().flush();
            response->response().end();
        }

        catch (const std::exception & ex)
        {
            // wow bad
            ServerLogWriter::writeErrorLog(QString("async file chunk read failed for %1 due to: %2").arg(path, ex.what()));
        }

        if (safeReader)
        {
            if (fileReaders_.contains(safeReader))
                fileReaders_ -= safeReader;

            safeReader->deleteLater();
        }
    },Qt::QueuedConnection);

    connect(reader,&AsyncFileReader::failed,response,[this,response,safeReader,path](const QString & errorDescription) {
        ServerLogWriter::writeErrorLog(QString("async file read for %1 failed with: %2").arg(path, errorDescription));


        try
        {
            response->response().flush();
            response->response().end();
        }

        catch (const std::exception & ex)
        {
            // wow bad
            ServerLogWriter::writeErrorLog(QString("async file read failed for %1 due to: %2").arg(path, ex.what()));
        }

        if (safeReader)
        {
            if (fileReaders_.contains(safeReader))
                fileReaders_ -= safeReader;

            safeReader->deleteLater();
        }
    },Qt::QueuedConnection);

    reader->requestChunk(65536);
}

QString HttpWebServer::deduceHtmlDirectory()
{
    QString determinedLocation = QCoreApplication::applicationDirPath() + "/html";
    ServerLogWriter::writeSetupLog("Deduced html files to be located at: " + determinedLocation);
    return determinedLocation;
}

QString HttpWebServer::deduceUpgradeDirectory()
{
    QString determinedLocation = QCoreApplication::applicationDirPath() + ROOT_UPDATES_DIRECTORY;
    ServerLogWriter::writeSetupLog("Deduced upgrader files to be located at: " + determinedLocation);
    return determinedLocation;
}

QString HttpWebServer::deduceInstallerDirectory()
{
    QString determinedLocation = QCoreApplication::applicationDirPath() + ROOT_INSTALLERS_DIRECTORY;
    ServerLogWriter::writeSetupLog("Deduced installer files to be located at: " + determinedLocation);
    return determinedLocation;
}
