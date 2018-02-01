#ifndef HTTP_HTTPRESPONSE_H
#define HTTP_HTTPRESPONSE_H

#include <QObject>
#include <QPointer>

#include <Common/Core/Pods/helpers/ToJson.h>
#include <Tufao/headers.h>

#include "Common/Protocol/server/ServerError.h"

#include "components/ServerLogWriter.h"

class AsyncCommandQueue;

namespace Tufao {
class HttpServerResponse;
class HttpServerRequest;
class Headers;
}

class HttpResponse : public QObject
{
public:
    explicit HttpResponse(Tufao::HttpServerResponse * response, Tufao::HttpServerRequest * request);
    ~HttpResponse();

    bool isValid() const;
    Tufao::HttpServerResponse & response();

    void connectQueue(AsyncCommandQueue * queue);

    template<typename PodType>
    void ok(const PodType& pod) {
        this->okWithByteArray(Core::Pods::toJson(pod));
    }

    //Set variable
    void addheaderContent(const QByteArray &key, const QByteArray &value);
    void setStandardEtag(const QByteArray & etag);
    void setStandardEtag(const QString &etag);
    void setStandardEtag(const QUuid &etag);
    void setCustomEtag(const QByteArray & x_etag);
    void setPacketId(const QByteArray & lastPacket);
    void setHeaderOptions(const QList<QString> & options);
    void setContentTypeFile();
    void setContentTypeJson();
    void setContentTypeHtml();
    void setContentTypeText();
    void setContentTypeCustom(const QByteArray & type);
    void setContentDisposition(const QByteArray & disposition);
    void setCacheControlNoCache() const;
    void setWebSocketConnection(const QUuid &id);
    void setClientIdentification(const QString & name);
    void deleteCookie();
    void setAbstractUrl(const QString & url);

    //Successful Responses
    void created(const QUuid& id);
    void created(const QString & id);
    void created(const QUuid & id, QVariantMap & args);
    void created(const QList<QUuid> & ids);
    void okWithByteArray(const QByteArray & content);
    void okWithNoContent();

    void notModified();
    void noContent();
    void accepted();
    void acceptedWithContent(const QByteArray & content);
    void redirect(const QString & url);
    void tempRedirect(const QString & url);

    //Failure Responses
    void internalServerError(const QString & error, const QString & message = QString());
    void serviceUnavaiable(const QString & error);
    void badRequest(const QString & error, const QString & message = QString());
    void forbidden(const QString & error);
    void failedDependency(const QString & error);
    void unauthorized(const QString & error);
    void conflict(const QString & error);
    void locked(const QString & error);
    void gone(const QString & error);
    void notFound(const QString & error);
    void MethodNotFallowed(const QString & error);
    void notImplemented(const QString & error);
    void preconditionFailed(const QString & error);
    void resourceLocked(const QString & error);
    void unprocessableEntity(const QString & error);
    void upgradeRequired(const QString & error);

private:
    void appendAccessHeader(const QByteArray & value);
    void writeErrorResponse(const QString & error, const QString & message, int code);
    void cleanResponse(); //Tufao sucks. Uses insert instead of replace when setting cookies, meaning response headers are tooooo big. Enough to cause Chrome to response with a reaponse header is too big error.
    QPointer< Tufao::HttpServerResponse > response_;
    Tufao::Headers & headers_; //Calling any writeHead is considered expensive and care should be taken for avoid redundent calls

    QString clientIp_;
    QString clientName_;
    QString url_;
    QString abstractUrl_;
    QString method_;
};

#endif // HTTPRESPONSE_H
