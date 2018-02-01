#ifndef HTTP_PRIVATE_HTTPSERVERNODE_H
#define HTTP_PRIVATE_HTTPSERVERNODE_H
#include <QMap>
#include <QString>
#include <memory>

class HttpRequest;
class HttpResponse;

class HttpServerNode { //Acts as a branch for the HTTP routing system. Recursive container for url sections, with a node repesenting one section. /section1/section2/etc
public:
    HttpServerNode(QMap<QString, std::function<void(HttpRequest*, HttpResponse*)>> commandList, QMap<QString, std::shared_ptr<HttpServerNode>> nodeList) : commands_(commandList), branches_(nodeList) {}
    HttpServerNode() {}
    ~HttpServerNode() {}

    bool hasCommand(const QString & method) const { return commands_.contains(method); }
    std::function<void(HttpRequest*, HttpResponse*)> getCommand(const QString & method) const { return commands_[method]; }

    QList<QString> getMethods() { return commands_.keys(); }
    QMap<QString, std::shared_ptr<HttpServerNode>> & getBranches() { return branches_; }

private:
    QMap<QString, std::function<void(HttpRequest*, HttpResponse*)>> commands_; //Commands or nodes arn't expected to be deleted at any point during the execution of the program
    QMap<QString, std::shared_ptr<HttpServerNode>> branches_;
};


#endif // HTTPSERVERNODE_H
