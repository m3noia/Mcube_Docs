#include "Router.h"
#include "http/HttpRequest.h"
#include "http/HttpResponse.h"
#include "HttpSession.h"
#include "private/Defines.h"
#include "http/HttpAsyncHandler.h"
#include "Common/Core/Generics/Helpers/StringConversion.h"
#include "Common/Core/Generics/Helpers/JsonConvenience.h"
#include "http/private/HttpServerNode.h"

Router::Router() : permissions_(PermissionFactory()),
    null_([](HttpRequest * request, HttpResponse * response){ (void)request; (void)response; })
{
}

Router::~Router() {
}

void Router::setRoutingSystem(QMap<QString, std::shared_ptr<HttpServerNode>> & rootSystem){
    rootDirectory_ = HttpServerNode({},rootSystem);
    QVariantMap jsonApi;
    QStringList methodList;

    jsonApi.insert("methods", methodList);
    auto branches = rootDirectory_.getBranches();
    for(auto iter = branches.begin(); iter != branches.end(); ++iter) {
        jsonApi.insert(iter.key(), this->appendNodePod(iter.key() + "/", (*iter)));
    }
    auto list = rootDirectory_.getMethods();
    for(auto iter = list.begin(); iter != list.end(); ++iter) {
        methodList.append(QString(*iter));
    }

    //QFile file(AUTO_GENERATED_API);

    //file.open(QIODevice::WriteOnly | QIODevice::Text);

    //file.write(abToJson(jsonApi));
}

std::function<void(HttpRequest*, HttpResponse*)> Router::route(HttpRequest * request, HttpResponse * response)
{
    try {
        QString path = request->urlPath();
        auto method = request->method();

        std::shared_ptr<HttpServerNode> recursionContainer = std::make_shared<HttpServerNode>(rootDirectory_);
        QStringList fragementedUrl = path.split("/", QString::SkipEmptyParts);

        if(fragementedUrl.isEmpty())
            throw UnableToFindUrl("No URL given");
        for(int i = 0; i != fragementedUrl.size(); ++i)
        {
            QString urlSegment = fragementedUrl.at(i);
            if(recursionContainer->getBranches().contains(fragementedUrl[i]) && fragementedUrl[i] != ":id")
                recursionContainer = recursionContainer->getBranches()[fragementedUrl[i]];
            else if(recursionContainer->getBranches().contains(":id")) {
                request->appendId(urlSegment);
                fragementedUrl[i] = ":id";
                recursionContainer = recursionContainer->getBranches()[fragementedUrl[i]];
            }
            else
                throw UnableToFindUrl(fragementedUrl.join("/") + " at " + fragementedUrl[i]);
        }

        auto abstractUrl = fragementedUrl.join("/");

        request->setAbstractUrl(abstractUrl);
        response->setAbstractUrl(abstractUrl);

        if(method != "OPTIONS") {
            //Standards say that you cannot restrict an OPTION request based on credentials
            if(!permissions_.doesRequestHaveAccess(abstractUrl, request->urlPath(), request, response)) {
                throw DoesNotHavePermission();
            }
        }
        else {
            auto methodList = recursionContainer->getMethods();
            auto lambda = [this, abstractUrl, methodList](HttpRequest * httpRequest, HttpResponse * httpResponse)
            {
                auto finalList = permissions_.setMethodsList(abstractUrl, httpRequest->urlPath(), httpRequest, httpResponse, methodList);
                httpResponse->setHeaderOptions(finalList);
                httpResponse->okWithNoContent();
            };
            return lambda;
        }

        auto command = recursionContainer->getCommand(method);
        if(command == nullptr && recursionContainer->getMethods().isEmpty())
            throw UnableToFindUrl(path);
        else if(command == nullptr){
            throw UnableToFindMethodForUrl(method + ": " + path);
        }
        return command;
    }
    catch(...) {
        HttpAsyncHandler::genericErrorHandler_(request, response, std::current_exception());
        return null_;
    }
}

QVariantMap Router::appendNodePod(const QString & baseUrl, std::shared_ptr<HttpServerNode> node)
{
    QStringList methodList;
    QVariantMap map;
    auto list = node->getMethods();
    for(auto iter = list.begin(); iter != list.end(); ++iter) {
        methodList.append(QString(*iter));
    }
    if(methodList.size() > 0) {
        auto apiUrl = baseUrl;
        if(apiUrl.right(1) == "/")
            apiUrl.remove(apiUrl.size() - 1, 1);
    }

    map.insert("methods", methodList);

    auto branches = node->getBranches();
    for(auto iter = branches.begin(); iter != branches.end(); ++iter) {
        map.insert(baseUrl + iter.key(), this->appendNodePod(baseUrl + iter.key() + "/" ,(*iter)));        
    }
    return map;
}
