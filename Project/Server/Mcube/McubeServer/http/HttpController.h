#ifndef HTTP_HTTPCONTROLLER_H
#define HTTP_HTTPCONTROLLER_H

#include <Tufao/AbstractHttpServerRequestHandler>
#include <memory>
#include <QUrl>
#include "http/HttpWebServer.h"
#include "http/HttpAsyncHandler.h"
#include "components/ServerLogWriter.h"

class Router;
class UserRepository;
class DeviceRepository;
class CRLRepository;
class SessionRepository;
class HttpRequest;
class HttpResponse;
class HttpsServer;
class AccessToken;
class ConsoleSessionRepository;

struct HttpController final : public QObject, Tufao::AbstractHttpServerRequestHandler
{
    friend class HttpAsyncHandler;
public:
    explicit HttpController(Router & router);

    bool handleRequest(Tufao::HttpServerRequest & request, Tufao::HttpServerResponse & response) override;

private:
    bool etagIsCurrent(const QByteArray & etag, const QString & url, const HttpRequest *request, HttpResponse *response);
    bool getModifyToken(AccessToken * token, const QByteArray & etag, const QString & url, const HttpRequest *request, HttpResponse *response);
    bool requestVersioned(const HttpRequest *request, HttpResponse *response);

    Router & router_;
    HttpWebServer webpages_;

    std::shared_ptr<UserRepository> userRepository_;
    std::shared_ptr<DeviceRepository> deviceRepository_;
    std::shared_ptr<CRLRepository> CRLRepository_;
    std::shared_ptr<SessionRepository> sessionRepository_;
    std::shared_ptr<ConsoleSessionRepository> cookieRepository_;
};

#endif // HTTPCONTROLLER_H
