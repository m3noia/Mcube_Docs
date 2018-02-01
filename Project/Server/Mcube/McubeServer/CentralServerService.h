#ifndef CENTRALSERVERSERVICE_H
#define CENTRALSERVERSERVICE_H
#include <QCoreApplication>
#include <QtService>

class CentralServerWrapper;

class CentralServerService : public QtService<CentralServerWrapper>
{
public:
    CentralServerService();

private:
    virtual void start();
    virtual void stop();
    virtual void pause();
    virtual void resume();
    virtual void processCommand(int code);
};

#endif // CENTRALSERVERSERVICE_H
