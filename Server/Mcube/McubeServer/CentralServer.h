#ifndef CENTRALSERVER_H
#define CENTRALSERVER_H

#include <Tufao/HttpServer>
#include <Tufao/HttpServerRequestRouter>
#include <Tufao/HttpPluginServer>
#include <Tufao/HttpFileServer>
#include "http/HttpServer.h"
#include "http/Router.h"
#include "http/HttpController.h"
#include "http/HttpUpgrader.h"

class CentralServer
{
public:
    CentralServer();
};

#endif // CENTRALSERVER_H
