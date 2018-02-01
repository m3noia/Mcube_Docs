#include <QFile>
#include "InitRouter.h"

#include "Common/Core/Pods/Pods.h"
#include "Common/Core/Generics/Helpers/JsonConvenience.h"
#include "private/Defines.h"
#include "http/Router.h"
#include "components/CommandFactory.h"
#include "private/HttpServerNode.h"

namespace Server {

abPodWithIntellisenseFix( Server, CommandRoutingPod,
    abPodProperty(1, path, QString);
    abPodProperty(2, mapping, QHash<QString, QString>);
);

abPodWithIntellisenseFix( Server, CommandRoutingSegmentPod,
    abPodProperty(1, segment, CommandRoutingPod);
    abOptionalPodProperty(2, branches, QList<CommandRoutingSegmentPod>);
);

abPodWithIntellisenseFix( Server, CommandsRoutingListPod,
    abPodProperty(1, commands, QList<Server::CommandRoutingSegmentPod>);
);

}

std::shared_ptr<HttpServerNode> recursiveSegement(CommandPod * pod)
{
    QMap<QString, std::shared_ptr<HttpServerNode>> nodeMap;
    for(auto iter = pod->container_.begin(); iter != pod->container_.end(); ++iter)
    {
        nodeMap.insert(iter.key(), recursiveSegement(&iter.value()));
    }
    return std::shared_ptr<HttpServerNode>(new HttpServerNode(pod->funcMap, nodeMap));
}

void InitRouter::buildRouter(Router * router, CommandFactory &abstractFactory)
{
    auto commandList = abstractFactory.getCommandList().container_;
    QMap<QString, std::shared_ptr<HttpServerNode>> list;
    for(auto iter = commandList.begin(); iter != commandList.end(); ++iter)
    {
        list.insert(iter.key(), recursiveSegement(&iter.value()));
    }
    router->setRoutingSystem(list);
}

