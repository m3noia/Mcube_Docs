TEMPLATE = subdirs

SUBDIRS += \
    #Common \
    McubeServer

#McubeServer.depends *= Common

for(s,SUBDIRS) {
  QMAKE_CLEAN +=$$s/Makefile
}


