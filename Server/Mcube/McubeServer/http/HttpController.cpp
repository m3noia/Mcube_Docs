#include "HttpController.h"

#include <future>
#include <Tufao/HttpServerRequest>
#include <Tufao/HttpServerResponse>
#include <Tufao/SimpleSessionStore>
#include <Tufao/Session>
#include <QSslCertificate>
#include <QSqlDatabase>
#include <QThread>

#include "http/HttpAsyncHandler.h"
#include "http/HttpRequest.h"
#include "http/HttpResponse.h"
#include "http/HttpSession.h"
#include "http/HttpSimpleSessionStore.h"
#include "http/HttpServer.h"
#include "http/Router.h"
#include "components/AccessToken.h"

#include "repository/RepositorySuite.h"
#include "repository/devices/DeviceRepository.h"
#include "repository/certificates/CRLRepository.h"
#include "repository/sessions/SessionRepository.h"
#include "repository/users/ConsoleSessionRepository.h"
#include "repository/users/UserRepository.h"
#include "strategies/MassOnDiskStrategy.h"
#include "Common/Core/Pods/helpers/FromJson.h"
#include "Common/Core/Generics/Helpers/JsonConvenience.h"
#include "helpers/JsonPatchParser.h"
#include "private/Defines.h"
#include "private/Profiler.h"

void signal_callback_handler(int signum)
{
    (void)signum;
}


HttpController::HttpController(Router & router) :
    router_(router), userRepository_(RepositorySuite::getUserRepository()),
    deviceRepository_(RepositorySuite::getDeviceRepository()), CRLRepository_(RepositorySuite::getCRLRepository()),
    sessionRepository_(RepositorySuite::getSessionRepository()), cookieRepository_(RepositorySuite::getConsoleRepository())
{
}

bool HttpController::handleRequest(Tufao::HttpServerRequest & request, Tufao::HttpServerResponse & response)
{

    HttpAsyncHandler * handler = new HttpAsyncHandler(request, response, this);

    QObject::connect(&response, &Tufao::HttpServerResponse::finished, handler, &QObject::deleteLater, Qt::QueuedConnection);

    return true;
}

bool HttpController::etagIsCurrent(const QByteArray &etag, const QString &url, const HttpRequest * request, HttpResponse * response)
{
    SyncRepository & syncRepository = SyncRepository::getSyncRepository();
    try {
        QString modifiedUrl = url;
        modifiedUrl.replace("devices/self", "devices/" + abToString<QUuid>(request->uuidFromCertificate()));
        modifiedUrl.replace("consoles/self", "consoles/" + abToString<QUuid>(request->cookieUuid()));
        modifiedUrl.replace("users/self", "users/" + abToString<QUuid>(request->getUserId()));
        auto syncEtag = syncRepository.etagForUrl(modifiedUrl);
        response->setStandardEtag(syncEtag->tag());

        if(request->etag().isEmpty())
            return false;

        if(etag == syncEtag->tag()){
            response->notModified();
            return true;
        }
        return false;
    }
    catch(SyncRepository::UrlNotInList) {
        return false;
    }
}

bool HttpController::getModifyToken(AccessToken * token, const QByteArray &etag, const QString &url, const HttpRequest *request, HttpResponse *response)
{
    SyncRepository & syncRepository = SyncRepository::getSyncRepository();
    try {
        QString modifiedUrl = url;
        modifiedUrl.replace("devices/self", "devices/" + abToString<QUuid>(request->uuidFromCertificate()));
        modifiedUrl.replace("consoles/self", "consoles/" + abToString<QUuid>(request->cookieUuid()));
        auto syncEtag = syncRepository.etagForUrl(modifiedUrl);

        if(etag != syncEtag->tag() && !syncEtag->isServerSubcription()) {
            response->conflict(Protocol::ServerError::GENERIC_ETAG_CONFLICT);
            return false;
        }
        token->modifyLock(syncEtag);
        if(etag == syncEtag->tag() || syncEtag->isServerSubcription()) //First check might not be needed
            return true;

        response->conflict(Protocol::ServerError::GENERIC_ETAG_CONFLICT);
        return false;
    }
    catch(SyncRepository::UrlNotInList) {
        return true;
    }
}

bool HttpController::requestVersioned(const HttpRequest *request, HttpResponse *response)
{
    if(HTTP_MODIFICATION_REQUEST.contains(request->method())) {
        if(request->abVersion() != QString::number(PROTOCOL_VERSION).toLatin1()) {
            response->badRequest(Protocol::ServerError::GENERIC_PROTOCOL_INCORRECT);
            return false;
        }
    }
    return true;
}

