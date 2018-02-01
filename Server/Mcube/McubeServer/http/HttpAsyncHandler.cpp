#include "HttpAsyncHandler.h"
#include <QDebug>
#include <Tufao/HttpServerRequest>
#include <Tufao/HttpServerResponse>
#include <Tufao/SimpleSessionStore>
#include "Common/Core/Pods/helpers/FromJson.h"
#include "Common/Core/Generics/Helpers/JsonConvenience.h"
#include "helpers/JsonPatchParser.h"
#include "private/Defines.h"
#include "components/AccessToken.h"
#include "http/HttpController.h"
#include "http/Router.h"
#include "repository/devices/DeviceRepository.h"
#include "repository/certificates/CRLRepository.h"
#include "repository/sessions/SessionRepository.h"
#include "repository/users/ConsoleSessionRepository.h"
#include "repository/users/UserRepository.h"
#include "strategies/MassOnDiskStrategy.h"


std::function<void(HttpRequest*, HttpResponse*, std::exception_ptr ex)> HttpAsyncHandler::genericErrorHandler_ = [](HttpRequest *httpRequest, HttpResponse *httpResponse, std::exception_ptr ex){
    try {
        if(ex)
            std::rethrow_exception(ex);
        else
            httpResponse->internalServerError("std::exception_ptr null"); //std::exception_ptr is a shared_ptr if you, in the future, need to fix it.
    }
    catch(TransactionToken::lostTransaction) { }
    catch (Router::DoesNotHavePermission & ex) {
        httpResponse->unauthorized(Protocol::ServerError::GENERIC_UNAUTHORISED);
    }
    catch(const MassOnDiskStrategy::UnableToOpenFileException & ex) {
        ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
        httpResponse->internalServerError(Protocol::ServerError::ERROR_MISSING_EXEPECTED_FILE);
    }
    catch(const AbstractRepository::EtagMismatch & ex) {
        httpResponse->conflict(Protocol::ServerError::GENERIC_ETAG_CONFLICT);
    }
    catch (const AbstractRepository::EtagOutOfDate & ex) {
        httpResponse->conflict(Protocol::ServerError::GENERIC_ETAG_CONFLICT);
    }
    catch(AbstractRepository::ResourceNotFound & ex) {
        httpResponse->notFound(Protocol::ServerError::GENERIC_RESOURCE_NOT_FOUND);
    }
    catch (Router::UnableToFindMethodForUrl & ex) {
        httpResponse->MethodNotFallowed(Protocol::ServerError::GENERIC_METHOD_NOT_ALLOWED);
    }
    catch (const HttpRequest::IdInvalidForFormat & ex) {
        httpResponse->notFound(Protocol::ServerError::GENERIC_RESOURCE_NOT_FOUND);
    }
    catch (Router::UnableToFindUrl & ex) {
        httpResponse->notFound(Protocol::ServerError::GENERIC_LOCATION_NOT_FOUND);
    }
    catch(const Core::Generics::Helpers::StringConversion::InvalidConversion & ex ) {
        if(!httpRequest->isModifyRequest()) {
            ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
            httpResponse->internalServerError(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
        }
        else
            httpResponse->badRequest(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
    }
    catch(const std::bad_function_call & ex) {
        ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
        httpResponse->internalServerError(Protocol::ServerError::CRITIAL_UNASSIGNED_LAMBDA);
    }
    catch(const AbstractRepository::ResourceAlreadyInStrategy & ex) {
        qDebug() << ex.what();
        httpResponse->conflict(Protocol::ServerError::GENERIC_RESOURCE_ID_ALREADY_USED);
    }
    catch(const Core::Pods::JsonDocumentNotObject & ex){
        qDebug() << ex.what();
        if(!httpRequest->isModifyRequest()) {
            ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
            httpResponse->internalServerError(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
        }
        else
            httpResponse->badRequest(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
    }
    catch(const Core::Generics::Helpers::JsonDocumentNotObject & ex) {
        qDebug() << ex.what();
        if(!httpRequest->isModifyRequest()) {
            ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
            httpResponse->internalServerError(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
        }
        else
            httpResponse->badRequest(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
    }
    catch(const Core::Pods::Pod::ReadFailed & ex) {
        qDebug() << ex.what();
        if(!httpRequest->isModifyRequest()) {
            ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
            httpResponse->internalServerError(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
        }
        else
            httpResponse->badRequest(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR,ex.what());
    }
    catch(const Core::Pods::JsonParseError & ex) {
        qDebug() << ex.what();
        if(!httpRequest->isModifyRequest()) {
            ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
            httpResponse->internalServerError(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
        }
        else
            httpResponse->badRequest(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
    }
    catch(const Core::Generics::Helpers::JsonParseError & ex) {
        qDebug() << ex.what();
        if(!httpRequest->isModifyRequest()) {
            ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
            httpResponse->internalServerError(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
        }
        else
            httpResponse->badRequest(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
    }
    catch(const Protocol::AnyToServer::PatchParseError & ex) {
        qDebug() << ex.what();
        if(!httpRequest->isModifyRequest()) {
            ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
            httpResponse->internalServerError(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
        }
        else
            httpResponse->badRequest(Protocol::ServerError::GENERIC_JSON_PARSE_ERROR, ex.what());
    }
    catch(const Protocol::AnyToServer::PatchParseUnknownEntry & ex) {
        qDebug() << ex.what();
        httpResponse->badRequest(Protocol::ServerError::GENERIC_RESOURCE_ASSOCIATED_DATA_NOT_FOUND);
    }
    catch(const AbstractRepository::StrategyBusy & ex) {
        qDebug() << ex.what();
        httpResponse->serviceUnavaiable(Protocol::ServerError::GENERIC_STRATEGY_BUSY);
    }
    catch(const HttpRequest::EtagNotIncluded & ex) {
        qDebug() << ex.what();
        httpResponse->badRequest(Protocol::ServerError::GENERIC_ETAG_MISSING);
    }
    catch( const SqlToken::TransactionBusy & ex) {
        ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
        httpResponse->internalServerError(Protocol::ServerError::GENERIC_STRATEGY_BUSY);
    }
    catch(std::bad_alloc & ex) {
        ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
        httpResponse->internalServerError(ex.what());
    }
    catch(const std::exception & ex) {
        ServerLogWriter::writeWarningLog(httpRequest->url().toString(), ex.what());
        httpResponse->internalServerError(ex.what());
    }
    catch(...) {
        httpResponse->internalServerError("Broke");
    }
};

HttpAsyncHandler::HttpAsyncHandler(Tufao::HttpServerRequest & request, Tufao::HttpServerResponse & response, HttpController * controller) : url_(request.url().toString()), controller_(controller), profiler_("HttpAsyncHandler", request.url().toString(), request.method())
{
    requestPointer = &request;
    responsePointer = &response;
    QObject::connect(&request, &Tufao::HttpServerRequest::end, this, &HttpAsyncHandler::onRequestReady);
    QObject::connect(&response, &Tufao::HttpServerResponse::finished, this, &HttpAsyncHandler::onRequestComplete, Qt::DirectConnection);
    profiler_.mark("Signal connected");
}

HttpAsyncHandler::~HttpAsyncHandler()
{
    token.finished();
}

void HttpAsyncHandler::onRequestReady()
{
    profiler_.mark("Signal emitted");

    //qDebug() << "Url: " << requestPointer->url() << " Method: " << requestPointer->method();

    httpRequest.reset(new HttpRequest(requestPointer));
    httpResponse.reset(new HttpResponse(responsePointer,requestPointer));

    ServerLogWriter::writePreSuccessAccessLog(httpRequest->ipAddress(), requestPointer->method(), requestPointer->url().toString());

    QString path = httpRequest->url().path();

    profiler_.mark("Constructors made 1");

    if(path == "/" || path == "/admin") {
        httpResponse->tempRedirect("/admin/");
        return;
    }

    if (path.startsWith(ROOT_WEB_DIRECTORY)) {
        path.remove(0, QString(ROOT_WEB_DIRECTORY).size());
        controller_->webpages_.handoutWebPage(httpRequest.data(), httpResponse.data(), path);
        return;
    }
    else if (path.startsWith(ROOT_UPDATES_DIRECTORY)) {
        path.remove(0, QString(ROOT_UPDATES_DIRECTORY).size());
        controller_->webpages_.handoutUpgradeFile(httpRequest.data(), httpResponse.data(), path);
        return;
    }
    else if (path.startsWith(ROOT_INSTALLERS_DIRECTORY)) {
        path.remove(0, QString(ROOT_INSTALLERS_DIRECTORY).size());
        controller_->webpages_.handoutInstallerFile(httpRequest.data(), httpResponse.data(), path);
        return;
    }
    else
        httpResponse->setContentTypeJson();

    if(!controller_->requestVersioned(httpRequest.data(), httpResponse.data())){
        return;
    }

    profiler_.mark("Constructors made 2");

    try
    {
        if(httpRequest->hasSslCertificate()) {
            try {
                if( controller_->CRLRepository_->certificateIsRevokved(httpRequest->certificate()) || httpRequest->certificate().expiryDate() < QDateTime::currentDateTimeUtc() || httpRequest->certificate().effectiveDate() > QDateTime::currentDateTimeUtc() ) {
                    httpResponse->unauthorized(Protocol::ServerError::SSL_REVOKED);
                    return;
                }
                auto device = controller_->deviceRepository_->findDeviceById(httpRequest->uuidFromCertificate());
                httpResponse->setClientIdentification(abToString(device->id()));
                controller_->sessionRepository_->refreshSessions(device); //Calls QueryBuilder still
            }
            catch(DeviceRepository::DeviceNotFoundException ) {}
        }
        else {
            HttpSession httpSession(httpRequest.data(), httpResponse.data());
            if(httpSession.isLoggedIn()) {
                httpRequest->setUserId(httpSession.userId());
                httpRequest->setRealm(httpSession.realm());
                auto user = controller_->userRepository_->findUserById(httpSession.userId());
                httpResponse->setClientIdentification(user->username());
                if(httpSession.isConsoleLoggedIn()) {
                    if(!controller_->cookieRepository_->isUserLoggedIn(httpRequest->cookieUuid(), httpSession.userId()))
                        httpSession.logout();
                    else
                        controller_->cookieRepository_->refreshExpiry(httpRequest->cookieUuid());
                }
                httpSession.refreshExpirePeriod(); //Refreshes tufao's internal session timeout
            }
        }
    }
    catch(UserRepository::UserNotFoundException & ex) {
            HttpSession httpSession(httpRequest.data(), httpResponse.data());
            qDebug() << ex.what();
            httpSession.logout();
            controller_->cookieRepository_->removeConsoleSession(httpRequest->cookieUuid());
            httpResponse->unauthorized(Protocol::ServerError::USERS_USER_DELETED);
            return;
    }
    catch(const std::exception & ex) {
            qDebug() << "Request init: " << ex.what();
            HttpSession httpSession(httpRequest.data(), httpResponse.data());
            ServerLogWriter::writeInternalSystemErrorLog("Request init: " + requestPointer->url().toString(), ex.what(), httpRequest->hasSslCertificate() ? httpRequest->hostnameFromCertificate() : httpSession.username());
            httpResponse->internalServerError(Protocol::ServerError::GENERIC_STRATEGY_BUSY);
            return;
    }

    profiler_.mark("Request init made");

    try {
        auto command = controller_->router_.route(httpRequest.data(), httpResponse.data());

        profiler_.mark("Lambda found");
        profiler_.setUrl(httpRequest->getAbstractUrl());

        if(httpRequest->method() == "GET") {
            if(controller_->etagIsCurrent(httpRequest->etag(), httpRequest->urlPath(), httpRequest.data(), httpResponse.data())) {
                return;
            }
        }
        else if(httpRequest->method() == "PUT" || httpRequest->method() == "PATCH" || httpRequest->method() == "DELETE") {
            if(!controller_->getModifyToken(&token, httpRequest->etag(), httpRequest->urlPath(), httpRequest.data(), httpResponse.data())) {
                return;
            }
        }

        command(httpRequest.data(), httpResponse.data());

    }
    catch(...) {
        genericErrorHandler_(httpRequest.data(), httpResponse.data(), std::current_exception());
    }
}


void HttpAsyncHandler::onRequestComplete()
{
    profiler_.mark("Logic executed");
}

