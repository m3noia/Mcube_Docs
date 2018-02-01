#ifndef HTTP_HTTPASYNCHANDLER_H
#define HTTP_HTTPASYNCHANDLER_H
#include <functional>
#include "http/HttpRequest.h"
#include "http/HttpResponse.h"
#include "http/HttpSession.h"
#include "private/Profiler.h"
#include "components/AccessToken.h"

class HttpController;
class AsyncCommandQueue;
class RouterRequest;

class HttpAsyncHandler : public QObject
{
    Q_OBJECT
public:
    HttpAsyncHandler(Tufao::HttpServerRequest & request, Tufao::HttpServerResponse & response, HttpController * controller);
    ~HttpAsyncHandler();

    static std::function<void(HttpRequest*, HttpResponse*, std::exception_ptr)> genericErrorHandler_;

public slots:
    void onRequestReady();
    void onRequestComplete();

private:
    QScopedPointer< HttpRequest, QScopedPointerDeleteLater > httpRequest;
    QScopedPointer< HttpResponse, QScopedPointerDeleteLater > httpResponse;

    QString url_;
    Tufao::HttpServerRequest * requestPointer;
    Tufao::HttpServerResponse * responsePointer;
    HttpController * controller_;
    AccessToken token;
    Profiler profiler_;
};

#endif // HTTP_HTTPASYNCHANDLER_H
