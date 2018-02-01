#ifndef HTTPSIMPLESESSIONSTORE_H
#define HTTPSIMPLESESSIONSTORE_H
#include <Tufao/SimpleSessionStore>

class HttpSimpleSessionStore : public Tufao::SimpleSessionStore //Exists to allow access to the function 'session', breaking encapulation because good design
{
public:
    HttpSimpleSessionStore(QObject *parent = 0);
    QByteArray session(const Tufao::HttpServerRequest &request) const;
    QByteArray session(const Tufao::HttpServerRequest &request, const Tufao::HttpServerResponse &response) const;

};

#endif // HTTPSIMPLESESSIONSTORE_H
