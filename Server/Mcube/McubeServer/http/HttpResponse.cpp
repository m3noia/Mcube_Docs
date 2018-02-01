#include "HttpResponse.h"

#include <QDebug>
#include <QUrl>
#include <Tufao/Headers>
#include <Tufao/HttpServerResponse>
#include <Tufao/HttpServerRequest>
#include <Tufao/IByteArray>
#include <QList>

#include "Common/Core/Generics/Helpers/StringConversion.h"
#include "Common/Protocol/server/ServerToAny.h"
#include "private/Profiler.h"
#include "repository/SyncRepository.h"
#include "helpers/AsyncCommandQueue.h"


HttpResponse::HttpResponse(Tufao::HttpServerResponse * response, Tufao::HttpServerRequest * request) :
    QObject(),
    response_(response),
    headers_(response_->headers()),
    clientIp_(request->property("ip").toString()),
    url_(request->url().toString()),
    abstractUrl_(url_),
    method_(request->method())
{
    headers_.insert("X-AB-Protocol", QString::number(PROTOCOL_VERSION).toLatin1());
    auto list = request->headers().values("Connection");
    for(auto iter = list.begin(); iter != list.end(); ++iter)
        if((*iter).toLower() == "keep-alive") {
            headers_.insert("Connection", "keep-alive");
            break;
        }
}

HttpResponse::~HttpResponse()
{

}

bool HttpResponse::isValid() const
{
    return !response_.isNull();
}

Tufao::HttpServerResponse &HttpResponse::response()
{
    if (!response_)
        throw std::runtime_error("no response");

    return *response_;
}

void HttpResponse::connectQueue(AsyncCommandQueue * queue)
{
    connect(response_.data(), SIGNAL(finished()), queue, SLOT(deleteLater()));
}

void HttpResponse::created(const QUuid &id)
{
    response_->writeHead(Tufao::HttpResponseStatus::CREATED);
    cleanResponse();
    auto content = Protocol::ServerToAny::CreatedUuidPod::make(id).toJson();
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::CREATED, content.size());
    response_->end(content);
}

void HttpResponse::created(const QString &id)
{
    response_->writeHead(Tufao::HttpResponseStatus::CREATED);
    cleanResponse();
    auto content = Protocol::ServerToAny::CreatedStrPod::make(id).toJson();
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::CREATED, content.size());
    response_->end(content);
}

void HttpResponse::created(const QUuid &id, QVariantMap &args)
{
    if(response_.isNull())
        return;
    response_->writeHead(Tufao::HttpResponseStatus::CREATED);
    cleanResponse();
    auto content = Protocol::ServerToAny::CreatedUuidArgsPod::make(id, args).toJson();
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::CREATED, content.size());
    response_->end(content);
}

void HttpResponse::created(const QList<QUuid> & ids)
{
    response_->writeHead(Tufao::HttpResponseStatus::CREATED);
    cleanResponse();
    auto content = Protocol::ServerToAny::CreatedUuidListPod::make(ids).toJson();
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::CREATED, content.size());
    response_->end(content);
}

void HttpResponse::addheaderContent(const QByteArray &key, const QByteArray &value)
{
    headers_.insert(key, value);
}

void HttpResponse::setStandardEtag(const QByteArray & etag) {
    appendAccessHeader("ETag");
    headers_.replace("ETag", etag);
}

void HttpResponse::setStandardEtag(const QString & etag) {
    appendAccessHeader("ETag");
    headers_.replace("ETag", abFromString<QByteArray>(etag));
}

void HttpResponse::setStandardEtag(const QUuid & etag) {
    appendAccessHeader("ETag");
    headers_.replace("ETag", abToString<QUuid>(etag).toLatin1());
}

void HttpResponse::setCustomEtag(const QByteArray & x_etag){
    appendAccessHeader("X-ETag");
    headers_.replace("X-ETag", x_etag);
}

void HttpResponse::setPacketId(const QByteArray &lastPacket)
{
    headers_.replace("X-Packet-ID", lastPacket);
}

void HttpResponse::setHeaderOptions(const QList<QString> &options)
{
    headers_.replace("Allow", options.join(",").toLatin1());
}

void HttpResponse::setContentTypeJson()
{
    headers_.replace("Content-Type", "application/json; charset=utf-8");
}

void HttpResponse::setContentTypeHtml()
{
    headers_.replace("Content-Type", "text/html; charset=utf-8");
}

void HttpResponse::setContentTypeText()
{
    headers_.replace("Content-Type", "text/plain; charset=utf-8");
}

void HttpResponse::setContentTypeCustom(const QByteArray &type)
{
    headers_.replace("Content-Type", type);
}

void HttpResponse::setContentDisposition(const QByteArray &disposition)
{
    headers_.replace("Content-Disposition", disposition);
}

void HttpResponse::setCacheControlNoCache() const
{
    headers_.replace("Cache-Control", "no-cache, no-store");
}

void HttpResponse::setWebSocketConnection(const QUuid & id)
{
    headers_.replace("Update", "WebSocket");
    headers_.replace("Connection", "Upgrade");
    headers_.replace("Sec-WebSocket-Accept", id.toByteArray());
    headers_.replace("Sec-WebSocket-Protocol", "chat");
    this->setContentTypeHtml();
    cleanResponse();
    response_->writeHead(Tufao::HttpResponseStatus::SWITCHING_PROTOCOLS);
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::SWITCHING_PROTOCOLS, 0);
    response_->end();
}

void HttpResponse::setClientIdentification(const QString &name)
{
    clientName_ = name;
}

void HttpResponse::deleteCookie()
{
    response_->headers().replace("Set-Cookie", "token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT");
    headers_.replace("Set-Cookie", "token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT");
}

void HttpResponse::setAbstractUrl(const QString & url)
{
    abstractUrl_ = url;
}

void HttpResponse::setContentTypeFile()
{
    headers_.replace("Content-Type", "multipart/form-data; charset=utf-8");
}

void HttpResponse::okWithByteArray(const QByteArray &content)
{
    response_->writeHead(Tufao::HttpResponseStatus::OK);
    cleanResponse();
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::OK, content.size());
    response_->end(content);
}

void HttpResponse::acceptedWithContent(const QByteArray &content)
{
    response_->writeHead(Tufao::HttpResponseStatus::ACCEPTED);
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::ACCEPTED, content.size());
    response_->end(content);
}

void HttpResponse::okWithNoContent()
{
    response_->writeHead(Tufao::HttpResponseStatus::OK);
    cleanResponse();
    if(headers_.value("Content-Type") == "application/json; charset=utf-8") {
        QByteArray content("{}");
        ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::OK, content.size());
        response_->end(content);
    }
    else {
        ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::OK, 0);
        response_->end();
    }
}

void HttpResponse::notModified()
{
    response_->writeHead(Tufao::HttpResponseStatus::NOT_MODIFIED);
    cleanResponse();
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::NOT_MODIFIED, 0);
    response_->end();
}

void HttpResponse::accepted()
{
    response_->writeHead(Tufao::HttpResponseStatus::ACCEPTED);
    cleanResponse();
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::ACCEPTED, 0);
    response_->end();
}

void HttpResponse::redirect(const QString & url)
{
    Tufao::Headers header;
    header.insert("Location", url.toLatin1());
    cleanResponse();
    response_->writeHead(Tufao::HttpResponseStatus::FOUND, header);
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::FOUND, 0);
    response_->end();
}

void HttpResponse::tempRedirect(const QString &url)
{
    Tufao::Headers header;
    header.insert("Location", url.toLatin1());
    cleanResponse();
    response_->writeHead(Tufao::HttpResponseStatus::FOUND, header);
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::FOUND, 0);
    response_->end();
}

void HttpResponse::notFound(const QString & error)
{
    response_->writeHead(Tufao::HttpResponseStatus::NOT_FOUND);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::NOT_FOUND);
}

void HttpResponse::MethodNotFallowed(const QString & error)
{
    response_->writeHead(Tufao::HttpResponseStatus::METHOD_NOT_ALLOWED);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::METHOD_NOT_ALLOWED);
}

void HttpResponse::notImplemented(const QString & error)
{
    response_->writeHead(Tufao::HttpResponseStatus::NOT_IMPLEMENTED);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::NOT_IMPLEMENTED);
}

void HttpResponse::preconditionFailed(const QString &error)
{
    response_->writeHead(Tufao::HttpResponseStatus::PRECONDITION_FAILED);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::PRECONDITION_FAILED);
}

void HttpResponse::resourceLocked(const QString & error)
{
    response_->writeHead(Tufao::HttpResponseStatus::LOCKED);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::LOCKED);
}

void HttpResponse::unprocessableEntity(const QString & error)
{
    response_->writeHead(Tufao::HttpResponseStatus::UNPROCESSABLE_ENTITY);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::UNPROCESSABLE_ENTITY);
}

void HttpResponse::upgradeRequired(const QString & error)
{
    response_->writeHead(Tufao::HttpResponseStatus::UPGRADE_REQUIRED);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::UPGRADE_REQUIRED);
}

void HttpResponse::appendAccessHeader(const QByteArray &value)
{
    if(!headers_.contains("Access-Control-Expose-Headers"))
        headers_.replace("Access-Control-Expose-Headers", value);
    else {
        auto content = headers_.value("Access-Control-Expose-Headers");
        content.append(";" + value);
        headers_.replace("Access-Control-Expose-Headers", content);
    }
}

void HttpResponse::writeErrorResponse(const QString &error, const QString &message, int code)
{
    response_->headers().remove("ETag");
    cleanResponse();
    if(headers_.value("Content-Type") == "application/json; charset=utf-8") {
        auto content = Core::Pods::toJson(Protocol::ServerToAny::ErrorPod::make(error, message));
        ServerLogWriter::writeErrorAccessLog(clientIp_, clientName_, method_, url_, code, content.size());
        response_->end(content);
    }
    else { //This is due to the server not having correct formatting to send error responses outside of json, such as html. Probably should put that on the todo list
        ServerLogWriter::writeErrorAccessLog(clientIp_, clientName_, method_, url_, code, 0);
        response_->end();
    }
}

void HttpResponse::cleanResponse()
{
    auto cookieHeaders = headers_.values("Set-Cookie");

    if(cookieHeaders.size() <= 1)
        return;

    headers_.remove("Set-Cookie");

    QSet< QByteArray > alreadySet; // cookie names we've already set

    for (const auto & cookieHeader : cookieHeaders)
    {
        auto firstEqualsIndex = cookieHeader.indexOf('=');

        auto cookieName = (firstEqualsIndex != -1) ? cookieHeader.left(firstEqualsIndex) : cookieHeader;

        if (!alreadySet.contains(cookieName))
        {
            alreadySet += cookieName;

            headers_.insert("Set-Cookie",cookieHeader);
        }
    }
}

void HttpResponse::noContent()
{
    response_->writeHead(Tufao::HttpResponseStatus::NO_CONTENT);
    cleanResponse();
    ServerLogWriter::writeAccessLog(clientIp_, clientName_, method_, url_, (int)Tufao::HttpResponseStatus::NO_CONTENT, 0);
    response_->end();
}

void HttpResponse::internalServerError(const QString & error, const QString & message)
{
    qDebug()  << error << " INTERNAL SERVER ERROR INTERNAL SERVER ERROR!!!!\n\n";
    ServerLogWriter::writeInternalSystemErrorLog(url_, error, clientName_);
    response_->writeHead(Tufao::HttpResponseStatus::INTERNAL_SERVER_ERROR);
    if(message.isEmpty())
        this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::INTERNAL_SERVER_ERROR);
    else
        this->writeErrorResponse(error, message, (int)Tufao::HttpResponseStatus::INTERNAL_SERVER_ERROR);
}

void HttpResponse::serviceUnavaiable(const QString & error)
{
    response_->writeHead(Tufao::HttpResponseStatus::INTERNAL_SERVER_ERROR);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::INTERNAL_SERVER_ERROR);
}

void HttpResponse::badRequest(const QString & error, const QString & message)
{
    response_->writeHead(Tufao::HttpResponseStatus::BAD_REQUEST);
    if(message.isEmpty())
        this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::BAD_REQUEST);
    else
        this->writeErrorResponse(error, message, (int)Tufao::HttpResponseStatus::BAD_REQUEST);
}

void HttpResponse::forbidden(const QString & error)
{
    response_->writeHead(Tufao::HttpResponseStatus::FORBIDDEN);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::FORBIDDEN);
}

void HttpResponse::failedDependency(const QString &error)
{
    response_->writeHead(Tufao::HttpResponseStatus::FAILED_DEPENDENCY);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::FAILED_DEPENDENCY);
}

void HttpResponse::unauthorized(const QString & error)
{
    response_->writeHead(Tufao::HttpResponseStatus::UNAUTHORIZED);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::UNAUTHORIZED);
}

void HttpResponse::conflict(const QString & error)
{
    response_->writeHead(Tufao::HttpResponseStatus::CONFLICT);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::CONFLICT);
}

void HttpResponse::locked(const QString &error)
{
    response_->writeHead(Tufao::HttpResponseStatus::LOCKED);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::LOCKED);
}

void HttpResponse::gone(const QString &error)
{
    response_->writeHead(Tufao::HttpResponseStatus::LOCKED);
    this->writeErrorResponse(error, Protocol::ServerError::engError.value(error), (int)Tufao::HttpResponseStatus::GONE);
}



