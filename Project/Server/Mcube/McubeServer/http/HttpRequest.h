#ifndef HTTP_HTTPREQUEST_H
#define HTTP_HTTPREQUEST_H

#include <QObject>
#include <QUrl>
#include <QUrlQuery>
#include <QSslSocket>
#include <QMap>
#include <QUuid>
#include <QTimer>
#include <memory>
#include "Common/Core/Exception/Exception.h"
#include "helpers/AsyncCommandQueue.h"

namespace Tufao {
class Headers;
class HttpServerRequest;
}

class Command;
class Router;
class HttpResponse;
class QSslCertificate;

class HttpRequest : public QObject
{
public:
    abException(UnableToFindDeviceIdFromCertificate);
    abException(MissingExpectedArguement);
    abException(NoId);
    abException(IdInvalidForFormat);
    abException(EtagNotIncluded);
    abException(RequestClosed);

    static void profileInit();
    static int lastRequestThroughput();

    explicit HttpRequest(Tufao::HttpServerRequest * request);

    Tufao::HttpServerRequest & request();
    QString ipAddress() const;
    QByteArray lastPacketId() const;
    QByteArray content() const;
    QByteArray contentEtag() const;
    QByteArray PacketID() const;
    QByteArray contentType() const;
    QByteArray contentDisposition() const;
    QByteArray abVersion() const;
    bool isModifyRequest() const;
    bool isSameEtag(const QString &etag) const;
    QByteArray etag() const;
    QUuid cookieUuid() const;

    void setUrl(const QString & url);
    void setTempMethod(const QString & method);
    void setAbstractUrl(const QString & url);
    void resetMethod();
    QUrl url() const;
    QString urlPath() const;
    QString getAbstractUrl() const;
    QUrlQuery urlQuery() const;
    bool isPaginateRequest() const;

    void appendId(const QString & id);
    void setUserId(const QUuid & userId);
    void setRealm(const QString & realm);
    QUuid getUserId() const;
    QString getRealm() const;
    template<typename format>
    format getId(int pos) const; //May return a int, string or uuid in string form. expected to be converted into correct type inside of process command function

    template<typename format>
    format getFinalId() const; //May return a int, string or uuid in string form. expected to be converted into correct type inside of process command function

    QByteArray method() const;

    bool hasSslCertificate() const;
    QUuid uuidFromCertificate() const;
    QString hostnameFromCertificate() const;
    QSslCertificate certificate() const;

private:
    QStringList idList_;
    QUuid userId_;
    mutable QUuid cookieId_;
    QString realm_;
    QString abstractUrl_;
    QByteArray tempMethod_;
    mutable QUuid certificateId_;
    QMap<QString, QString> argumentList_;
    QPointer<Tufao::HttpServerRequest> request_;
    mutable QByteArray body_;
    QSslCertificate cert_;

    //Profile tools
    static QTimer timer_;
    static std::atomic_int counter_;
    static std::atomic_int record_;
};

#endif // HTTPREQUEST_H
