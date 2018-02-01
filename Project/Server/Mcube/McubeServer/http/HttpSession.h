#ifndef HTTP_HTTPSESSION_H
#define HTTP_HTTPSESSION_H

#include <QObject>
#include <memory>

#include <mutex>
#include <Tufao/Session>

#include "http/HttpSimpleSessionStore.h"
#include "Common/Core/Exception/Exception.h"


class HttpResponse;
class HttpRequest;
class Device;
class User;

namespace Tufao {
class Session;
}

class HttpSession
{
public:
    abException(UserLimitReached);
    explicit HttpSession(HttpRequest * httpRequest, HttpResponse * httpResponse);

    bool isSessionPresent() const;
    bool isLoggedIn();
    bool isConsoleLoggedIn() const;
    bool isAdminloggedIn() const;

    QUuid logUserIn(const std::shared_ptr<const User> user, const QString & realm);
    QUuid logAdminIn(const std::shared_ptr<const User> user, const QString & realm);
    void logout();

    void refreshExpirePeriod();
    QUuid sessionId() const;
    QString realm() const;
    QString username() const;
    QUuid userId() const; //Returns null uuid if account isn't logged in

private:
    HttpRequest * requestHelper_;
    HttpResponse * responseHelper_;
    static Tufao::SimpleSessionStore & store_;
    static std::recursive_mutex mutex_;
    Tufao::Session session_;
};

#endif // HTTPSESSION_H
