#ifndef HTTP_INITROUTER_H
#define HTTP_INITROUTER_H

#include <QString>

class Router;
class CommandFactory;

class InitRouter
{
public:
    static void buildRouter(Router * router, CommandFactory & abstractFactory);

};

#endif // INITROUTER_H
