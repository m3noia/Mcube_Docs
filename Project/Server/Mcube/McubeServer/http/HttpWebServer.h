#ifndef HTTP_HTTPWEBSERVER_H
#define HTTP_HTTPWEBSERVER_H

#include <QObject>
#include <QThread>
#include <QSet>

#include <Tufao/HttpFileServer>

#include "private/AsyncFileReader.h"

class HttpRequest;
class HttpResponse;

class HttpWebServer : public QObject
{
    Q_OBJECT

public:
    HttpWebServer();
    ~HttpWebServer();

    void handoutWebPage(HttpRequest * request, HttpResponse * response, const QString &path);
    void handoutUpgradeFile(HttpRequest * request, HttpResponse * reponse, const QString & path);
    void handoutInstallerFile(HttpRequest * request, HttpResponse * response, const QString & path);

private:
    void serveFile(HttpRequest * request, HttpResponse * response, const QString &path);
    void handout(HttpRequest *request, HttpResponse *response, const QString &location, const QString &webRoot);

private:
    static QString deduceHtmlDirectory();
    static QString deduceUpgradeDirectory();
    static QString deduceInstallerDirectory();


    QString rootHtmlDir_;
    QString rootUpgradeDir_;
    QString rootInstallerDir_;
    Tufao::HttpFileServer fileServer_;
    Tufao::HttpFileServer updateFileServer_;
    Tufao::HttpFileServer installerFileServer_;
    QStringList MIMETypes_;

    QThread fileIOThread_;

    QSet< AsyncFileReader * > fileReaders_;
};

#endif // HTTP_HTTPWEBSERVER_H
