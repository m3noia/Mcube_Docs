#include "HttpUpgrader.h"
#include <QRegularExpression>
#include <QRegularExpressionMatch>
#include "http/HttpRequest.h"
#include "http/HttpSession.h"
#include "http/HttpSimpleSessionStore.h"
#include "sockets/HttpWebSocketMasterController.h"
#include "components/ServerLogWriter.h"
#include "repository/RepositorySuite.h"
#include "repository/devices/DeviceRepository.h"
#include "repository/users/UserRepository.h"
#include "repository/users/ConsoleSessionRepository.h"
#include "repository/sessions/SessionRepository.h"
#include "repository/sessions/TerminalRepository.h"
#include "repository/certificates/CRLRepository.h"

HttpUpgrader::HttpUpgrader(QSharedPointer<HttpWebSocketMasterController> controller) : controller_(controller),
    userRepository_(RepositorySuite::getUserRepository()), deviceRepository_(RepositorySuite::getDeviceRepository()),
    CRLRepository_(RepositorySuite::getCRLRepository()), sessionRepository_(RepositorySuite::getSessionRepository()),
    terminalRepository_(RepositorySuite::getTerminalRepository()), consolesRepository_(RepositorySuite::getConsoleRepository())
{

}

bool HttpUpgrader::handleUpgrade(Tufao::HttpServerRequest &request, const QByteArray &head)
{
    HttpRequest httpRequest(&request);
    try {
        if(QRegularExpression("(\\/users/)(.*?)(\\/websocket)").match(httpRequest.urlPath()).hasMatch()) {
            if(!this->handleUserUpdate(httpRequest, head))
                request.close();
        }
        else if(QRegularExpression("(\\/devices/)(.*?)(\\/websocket)").match(httpRequest.urlPath()).hasMatch()) {
            if(!this->handleDeviceUpdate(httpRequest, head))
                request.close();
        }
        else
            request.close();

        return true;
    }
    catch(std::exception & ex) {
        qDebug() << ex.what();
        ServerLogWriter::writeInternalSystemErrorLog(request.url().toString(), QString::fromLatin1(ex.what()), httpRequest.ipAddress());
        return false;
    }
}

bool HttpUpgrader::handleUserUpdate(HttpRequest &request, const QByteArray &head)
{
    (void)head;
    try {
        auto user = userRepository_->findUserById(getUuidFromUrl(request.urlPath()));
        if(!consolesRepository_->isUserLoggedIn(request.cookieUuid(), user->id())) {
            return false;
        }

        auto result = controller_->addTutorConnection(request, request.cookieUuid(), user->id());

        if(result) {
            ServerLogWriter::writeLiveSocketConnection(request.ipAddress(), "Console", request.uuidFromCertificate());
        }
        return result;
    }
    catch(UserRepository::UserNotFoundException & ex) {
        qDebug() << ex.what();
        return false;
    }
}

bool HttpUpgrader::handleDeviceUpdate(HttpRequest &request, const QByteArray &head)
{
    try {
        (void)head;
        if(CRLRepository_->certificateIsRevokved(request.certificate()) || request.certificate().expiryDate() < QDateTime::currentDateTimeUtc() || request.certificate().effectiveDate() > QDateTime::currentDateTimeUtc() ) {
            return false;
        }

        auto device = deviceRepository_->findWritableDeviceById(request.uuidFromCertificate());
        sessionRepository_->refreshSessions(device);
        QMap<QUuid, QUuid> terminalWithSessions;
        auto terminals = terminalRepository_->findTerminalsByDevice(device).toSet();
        for(auto iter = terminals.begin(); iter != terminals.end(); ++iter) {
            auto sessions = sessionRepository_->findAllSessionsForTerminal((*iter));
            if(sessions.size() > 0)
                terminalWithSessions.insert((*iter), sessions.first());
        }
        auto success = controller_->addDeviceConnection(request, device, sessionRepository_->findAllSessionsForDevice(device).toSet(), terminalWithSessions);
        if(success) {
            //deviceRepository_->updateLiveEtag(device);
            ServerLogWriter::writeLiveSocketConnection(request.ipAddress(), "Device", request.uuidFromCertificate());
        }
        auto socket = controller_->findSocketByDevice(device);
        sessionRepository_->connectWebsocketToTimeout(device, socket);
        deviceRepository_->connectWebsocketToTimeout(device, socket);
        return success;

    }
    catch(DeviceRepository::DeviceNotFoundException & ex) {
        qDebug() << ex.what() << request.uuidFromCertificate();
        return false;
    }
    catch(std::bad_alloc & ex) {
        qDebug() << ex.what();
        return false;
    }
    catch(std::exception & ex) {
        qDebug() << ex.what();
        return false;
    }
}

QUuid HttpUpgrader::getUuidFromUrl(const QString & url)
{
    try
    {
        QStringList fragementedUrl = url.split("/", QString::SkipEmptyParts);
        return abFromString<QUuid>(fragementedUrl.at(1));
    }
    catch(Core::Generics::Helpers::StringConversion::InvalidConversion & ex) {
        qDebug() << ex.what();
        return QUuid();
    }
}

bool HttpUpgrader::validateConnection(HttpRequest &httpRequest) //TODO review
{
    if(!httpRequest.hasSslCertificate())
        return true; //Some access to the server is required in the event of having no certificate to get a certificate

    if(!deviceRepository_->containsDevice(httpRequest.uuidFromCertificate())) {
        return false; //The device has been removed from the database and the certificate is not longer suitable for internal logic of the server.
    }
    QSslCertificate certificate = httpRequest.certificate();

    if(certificate.effectiveDate() < QDateTime::currentDateTimeUtc()) {
        return false;
    }
    if(certificate.expiryDate() > QDateTime::currentDateTimeUtc()) {
        return false;
    }
    if(CRLRepository_->certificateIsRevokved(certificate)) {
        return false;
    }

    return true;
}
