#include "HttpSession.h"

#include "Tufao/headers.h"
#include "Common/Core/Generics/Helpers/StringConversion.h"

#include "http/HttpRequest.h"
#include "http/HttpResponse.h"
#include "repository/devices/DeviceRepository.h"
#include "entities/users/User.h"

#define ABTUTOR_USER "abtutor_user"
#define ABTUTOR_ADMIN "abtutor_admin"
#define ABTUTOR_SESSION "abtutor_session"
#define ABTUTOR_REALM "abtutor_realm"
#define ABTUTOR_USERNAME "abtutor_username"

Tufao::SimpleSessionStore & HttpSession::store_ = Tufao::SimpleSessionStore::defaultInstance();
std::recursive_mutex HttpSession::mutex_;

HttpSession::HttpSession(HttpRequest * httpRequest, HttpResponse * httpResponse) :
    requestHelper_(httpRequest),
    responseHelper_(httpResponse),
    session_(store_, requestHelper_->request(), responseHelper_->response())
{
}

bool HttpSession::isConsoleLoggedIn() const
{
    std::lock_guard<std::recursive_mutex> guard(mutex_);
    return !session_.value(ABTUTOR_USER).isNull();
}

bool HttpSession::isAdminloggedIn() const
{
    std::lock_guard<std::recursive_mutex> guard(mutex_);
    return !session_.value(ABTUTOR_ADMIN).isNull();
}

bool HttpSession::isSessionPresent() const
{
    std::lock_guard<std::recursive_mutex> guard(mutex_);
    return store_.hasSession(requestHelper_->request());
}

bool HttpSession::isLoggedIn()
{
    if(isConsoleLoggedIn() || isAdminloggedIn())
        return true;
    return false;
}

QUuid HttpSession::logUserIn(const std::shared_ptr<const User> user, const QString &realm)
{
    std::lock_guard<std::recursive_mutex> guard(mutex_);
    store_.resetSession(requestHelper_->request());
    store_.removeProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_USER);
    store_.removeProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_SESSION);
    store_.removeProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_REALM);
    store_.removeProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_USERNAME);

    store_.setProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_USER, user->id());
    store_.setProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_SESSION, QUuid::createUuid());
    store_.setProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_REALM, realm);
    store_.setProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_USERNAME, user->username());

    QRegularExpression rx("SID=(\\{.+\\})");

    auto match = rx.match(QString(responseHelper_->response().headers().value("Set-Cookie")));

    if (match.hasMatch())
        return QUuid(match.captured(1));

    return QUuid();

}

QUuid HttpSession::logAdminIn(const std::shared_ptr<const User> user, const QString & realm)
{
    std::lock_guard<std::recursive_mutex> guard(mutex_);
    store_.resetSession(requestHelper_->request());
    store_.removeProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_ADMIN);
    store_.removeProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_SESSION);
    store_.removeProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_REALM);
    store_.removeProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_USERNAME);

    store_.setProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_ADMIN, user->id());
    store_.setProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_SESSION, QUuid::createUuid());
    store_.setProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_REALM, realm);
    store_.setProperty(requestHelper_->request(), responseHelper_->response(), ABTUTOR_USERNAME, user->username());


    QRegularExpression rx("SID=(\\{.+\\})");

    auto match = rx.match(QString(responseHelper_->response().headers().value("Set-Cookie")));

    if (match.hasMatch())
        return QUuid(match.captured(1));

    return QUuid();
}

void HttpSession::logout()
{
    std::lock_guard<std::recursive_mutex> guard(mutex_);
    store_.removeSession( requestHelper_->request(), responseHelper_->response());
}

void HttpSession::refreshExpirePeriod()
{
    std::lock_guard<std::recursive_mutex> guard(mutex_);
    store_.property(requestHelper_->request(), responseHelper_->response(), "");
}

QUuid HttpSession::sessionId() const
{
    std::lock_guard<std::recursive_mutex> guard(mutex_);
    return session_.value(ABTUTOR_SESSION).toUuid();
}

QString HttpSession::realm() const
{
    std::lock_guard<std::recursive_mutex> guard(mutex_);
    return session_.value(ABTUTOR_REALM).toString();
}

QString HttpSession::username() const
{
    std::lock_guard<std::recursive_mutex> guard(mutex_);
    return session_.value(ABTUTOR_USERNAME).toString();
}

QUuid HttpSession::userId() const
{
    if(isConsoleLoggedIn()) {
        std::lock_guard<std::recursive_mutex> guard(mutex_);
        return session_.value(ABTUTOR_USER).toUuid();
    }
    if(isAdminloggedIn()) {
        std::lock_guard<std::recursive_mutex> guard(mutex_);
        return session_.value(ABTUTOR_ADMIN).toUuid();
    }
    return QUuid();
}

