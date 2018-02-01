#include "HttpRequest.h"

#include <QUuid>
#include <QDebug>
#include <typeinfo>

#include <Tufao/HttpServerRequest>
#include <Tufao/Headers>
#include <QAbstractSocket>
#include <QSslSocket>
#include "Common/SslUtil/Certificate.h"
#include "Common/SslUtil/OIDs.h"
#include "private/Defines.h"

#include "Common/Core/Generics/Helpers/StringConversion.h"
#include "http/Router.h"

QTimer HttpRequest::timer_;
std::atomic_int HttpRequest::counter_(0);
std::atomic_int HttpRequest::record_(0);

void HttpRequest::profileInit()
{
    timer_.setSingleShot(false);
    connect(&timer_, &QTimer::timeout, [](){
        HttpRequest::record_ = (int)counter_;
        HttpRequest::counter_ = 0; }
    );
    timer_.start(1000);
}

int HttpRequest::lastRequestThroughput()
{
    return (int)record_;
}

HttpRequest::HttpRequest(Tufao::HttpServerRequest * request) :
    QObject(),
    request_(request),
    cert_(dynamic_cast<QSslSocket*>(&request_->socket())->peerCertificate())
{
    counter_++;
}

Tufao::HttpServerRequest &HttpRequest::request() {
    return *request_;
}

QString HttpRequest::ipAddress() const
{
    return request_->property("ip").toString();
}

QByteArray HttpRequest::lastPacketId() const
{
    return request_->headers().value("X-Last-Packet-ID");
}

QByteArray HttpRequest::content() const {
    if(body_.isNull())
        body_ = request_->readBody();
    return body_;
}

QByteArray HttpRequest::contentEtag() const
{
    if(request_->headers().value("X-ETag").isEmpty())
        throw EtagNotIncluded();
    return request_->headers().value("X-ETag");
}

QByteArray HttpRequest::PacketID() const
{
    return request_->headers().value("X-Packet-ID");
}

QByteArray HttpRequest::contentType() const {
    return request_->headers().value("Content-Type");
}

QByteArray HttpRequest::contentDisposition() const
{
    return request_->headers().value("Content-Disposition");
}

QByteArray HttpRequest::abVersion() const
{
    return request_->headers().value("X-AB-Protocol");
}

bool HttpRequest::isModifyRequest() const
{
    return HTTP_MODIFICATION_REQUEST.contains(QString::fromLatin1(this->method()));
}

QByteArray HttpRequest::etag() const {
    return request_->headers().value("If-None-Match");
}

QUuid HttpRequest::cookieUuid() const
{
    if(!request_->headers().contains("Cookie"))
        return QUuid();
    if(cookieId_.isNull()) {
        QString temp = request_->headers().value("Cookie");
        cookieId_ = QUuid(temp.remove("SID="));
    }
    return cookieId_;
}

void HttpRequest::setUrl(const QString & url)
{
    request_->setUrl(QUrl(url));
}

void HttpRequest::setTempMethod(const QString &method)
{
    tempMethod_ = method.toLatin1();
}

void HttpRequest::setAbstractUrl(const QString & url)
{
    abstractUrl_ = url;
}

void HttpRequest::resetMethod()
{
    tempMethod_.clear();
}

QUrl HttpRequest::url() const {
    return request_->url();
}

QString HttpRequest::urlPath() const{
    return this->url().path();
}

QString HttpRequest::getAbstractUrl() const
{
    return abstractUrl_;
}

QUrlQuery HttpRequest::urlQuery() const
{
    return QUrlQuery(request_->url());
}

bool HttpRequest::isPaginateRequest() const
{
    auto query = urlQuery();
    return (query.hasQueryItem("count") && query.hasQueryItem("page") );
}

void HttpRequest::appendId(const QString & id) {
    idList_.push_back(id);
}

void HttpRequest::setUserId(const QUuid &userId)
{
    userId_= userId;
}

void HttpRequest::setRealm(const QString & realm)
{
    realm_ = realm;
}

QUuid HttpRequest::getUserId() const
{
    return userId_;
}

QString HttpRequest::getRealm() const
{
    return realm_;
}

template<>
QUuid HttpRequest::getId<QUuid>(int pos) const {
    if (idList_.at(pos) == "self")
    {
        if(urlPath().contains("devices/self"))
            return uuidFromCertificate();
        else if (urlPath().contains("consoles/self"))
            return cookieUuid();
        else if(urlPath().contains("users/self"))
            return userId_;
    }
    try {
        return Core::Generics::Helpers::StringConversion::fromString<QUuid>(idList_.at(pos));
    }
    catch(...) {
        throw IdInvalidForFormat();
    }
}

template<>
QString HttpRequest::getId<QString>(int pos) const {
    return idList_.at(pos);
}

template<>
int HttpRequest::getId<int>(int pos) const {
    return idList_.at(pos).toInt();
}

template<>
QByteArray HttpRequest::getId<QByteArray>(int pos) const {
    return idList_.at(pos).toLatin1();
}

QUuid HttpRequest::uuidFromCertificate() const {
    try{
        if(cert_.isNull())
            return QUuid();
        if(!certificateId_.isNull())
            return certificateId_;

        certificateId_ = request_->socket().property("clientId").toUuid();

        if (certificateId_.isNull())
        {
            certificateId_ = abFromString< QUuid >(SslUtil::Certificate(cert_.toPem()).extensionValueAsString(AB_OID_DEVICE_ID_SN));

            request_->socket().setProperty("clientId",certificateId_);
        }

        return certificateId_;
    }
    catch(SslUtil::Certificate::CertificateCreationFailed) {
        qDebug() << "No valid peer certificate found.";
        return QUuid();
    }
    catch(...) {
        qDebug() << "Unable to get id from certificate";
        return QUuid();
    }
}

QString HttpRequest::hostnameFromCertificate() const
{
    try{
        if(cert_.isNull())
            return QString();
        return cert_.subjectInfo(QSslCertificate::CommonName).first();
    }
    catch(SslUtil::Certificate::CertificateCreationFailed) {
        qDebug() << "No valid peer certificate found.";
        return QString();
    }
    catch(...) {
        qDebug() << "No valid peer certificate found.";
        return QString();
    }
}

QSslCertificate HttpRequest::certificate() const
{
    return cert_;
}

QByteArray HttpRequest::method() const
{
    if(tempMethod_.isEmpty())
        return request_->method().toUpper();
    return tempMethod_;
}

bool HttpRequest::hasSslCertificate() const
{
    return !cert_.isNull();
}

bool HttpRequest::isSameEtag(const QString & etag) const {
    return this->etag() == etag;
}

template<>
QString HttpRequest::getFinalId<QString>() const {
    return idList_.last();
}


