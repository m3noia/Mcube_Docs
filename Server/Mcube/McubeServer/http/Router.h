#ifndef HTTP_ROUTER_H
#define HTTP_ROUTER_H

#include <map>
#include <QRegularExpression>
#include <QUrl>
#include <QRunnable>
#include "Common/Core/Exception/Exception.h"

#include "http/private/HttpServerNode.h"
#include "components/PermissionFactory.h"

class Command;
class HttpServerNode;

class Router final
{
public:
    abException(DoesNotHavePermission);
    abExceptionWithMessage(UnableToFindUrl);
    abExceptionWithMessage(UnableToFindMethodForUrl);
    Router();
    ~Router();

    void setRoutingSystem(QMap<QString, std::shared_ptr<HttpServerNode> > &rootSystem);

    std::function<void (HttpRequest *, HttpResponse *)> route(HttpRequest * request, HttpResponse * response);

private:
    HttpServerNode rootDirectory_;
    PermissionFactory permissions_;
    std::function<void(HttpRequest*, HttpResponse*)> null_;

    QVariantMap appendNodePod(const QString & baseUrl, std::shared_ptr<HttpServerNode> node);

};

#endif // ROUTER_H
