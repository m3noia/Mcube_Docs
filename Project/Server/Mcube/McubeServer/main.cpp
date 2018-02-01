#include <QCoreApplication>
#include "CentralServer.h"
#include "CentralServerService.h"
#include "log/ServerLog.h"
#include <QDebug>

int main(int argc, char *argv[])
{
    QCoreApplication::setOrganizationDomain("1bytetech.com");
    QCoreApplication::setApplicationName("McubeServer");

    auto ret = -1;

    try {

            QCoreApplication a(argc, argv);
            auto server = CentralServerWrapper::buildCentralServer();
            server->listen();
            ret = a.exec();
    }
    catch(const CentralServer::PortOpeningFailure) {
        ServerLog::writeSetupError("Failed to load up the server. Either port 5151 is currently being used or another copy of the server is already running. Aborting program.");
    }


    return a.exec();
}
