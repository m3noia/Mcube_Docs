#include "HttpSimpleSessionStore.h"
#include "Tufao/simplesessionstore.h"

HttpSimpleSessionStore::HttpSimpleSessionStore(QObject *parent) : Tufao::SimpleSessionStore(Tufao::SessionStore::defaultSettings(), parent)
{

}

QByteArray HttpSimpleSessionStore::session(const Tufao::HttpServerRequest &request) const
{
    return Tufao::SessionStore::session(request);
}

QByteArray HttpSimpleSessionStore::session(const Tufao::HttpServerRequest &request, const Tufao::HttpServerResponse & response) const
{
    return Tufao::SessionStore::session(request, response);

}
