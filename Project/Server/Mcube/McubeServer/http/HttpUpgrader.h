#ifndef HTTPUPGRADER_H
#define HTTPUPGRADER_H

#include <Tufao/abstracthttpupgradehandler.h>
#include <Tufao/HttpUpgradeRouter>
#include <memory>

#include <QSharedPointer>

class ConsoleSessionRepository;
class UserRepository;
class DeviceRepository;
class CRLRepository;
class SessionRepository;
class TerminalRepository;
class HttpRequest;
class HttpWebSocketMasterController;

class HttpUpgrader : public Tufao::HttpUpgradeRouter
{
public:
    HttpUpgrader(QSharedPointer<HttpWebSocketMasterController> controller);

    bool handleUpgrade(Tufao::HttpServerRequest &request, const QByteArray &head) override;

private:
    bool handleUserUpdate(HttpRequest &request, const QByteArray &head);
    bool handleDeviceUpdate(HttpRequest & request, const QByteArray &head);

    QUuid getUuidFromUrl(const QString & url);

    QSharedPointer<HttpWebSocketMasterController> controller_;

    bool validateConnection(HttpRequest &httpRequest);

    std::shared_ptr<UserRepository> userRepository_;
    std::shared_ptr<DeviceRepository> deviceRepository_;
    std::shared_ptr<CRLRepository> CRLRepository_;
    std::shared_ptr<SessionRepository> sessionRepository_;
    std::shared_ptr<TerminalRepository> terminalRepository_;
    std::shared_ptr<ConsoleSessionRepository> consolesRepository_;
};

#endif // HTTPUPGRADER_H
