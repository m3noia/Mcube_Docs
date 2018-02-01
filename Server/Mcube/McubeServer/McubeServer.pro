include($$_PRO_FILE_PWD_/../qtservice/src/qtservice.pri)

SUBDIRS += \
    ../Common

QT += core network sql
QT -= gui

LIBDIR = $$PWD
INCLUDEDIR = $$PWD

DEFINES += TUFAO_VERSION_MAJOR=1
INCLUDEPATH += $$INCLUDEDIR/include/tufao-1
INCLUDEPATH += $$INCLUDEDIR/../../common
INCLUDEPATH += $$INCLUDEDIR/common
INCLUDEPATH += $$PWD/../../common
INCLUDEPATH += $$PWD/common

LIBS += -ltufao1
LIBS += -L$$LIBDIR/lib

CONFIG += c++11

TARGET = McubeServer
CONFIG += console
CONFIG -= app_bundle

TEMPLATE = app

SOURCES += main.cpp \
    CentralServer.cpp \
    http/HttpAsyncHandler.cpp \
    http/HttpController.cpp \
    http/HttpRequest.cpp \
    http/HttpResponse.cpp \
    http/HttpServer.cpp \
    http/HttpSession.cpp \
    http/HttpSimpleSessionStore.cpp \
    http/HttpThread.cpp \
    http/HttpUpgrader.cpp \
    http/HttpWebServer.cpp \
    http/InitRouter.cpp \
    http/Router.cpp \
    CentralServerService.cpp \
    log/ServerLog.cpp

# The following define makes your compiler emit warnings if you use
# any feature of Qt which as been marked deprecated (the exact warnings
# depend on your compiler). Please consult the documentation of the
# deprecated API in order to know how to port your code away from it.
DEFINES += QT_DEPRECATED_WARNINGS

# You can also make your code fail to compile if you use deprecated APIs.
# In order to do so, uncomment the following line.
# You can also select to disable deprecated APIs only up to a certain version of Qt.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

HEADERS += \
    CentralServer.h \
    http/HttpAsyncHandler.h \
    http/HttpController.h \
    http/HttpRequest.h \
    http/HttpResponse.h \
    http/HttpServer.h \
    http/HttpSession.h \
    http/HttpSimpleSessionStore.h \
    http/HttpThread.h \
    http/HttpUpgrader.h \
    http/HttpWebServer.h \
    http/InitRouter.h \
    http/Router.h \
    CentralServerService.h \
    log/ServerLog.h \
    private/defines.h

SUBDIRS += \
    ../common/Common.pro
