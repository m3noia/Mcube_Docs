app.controller('settings.sync.create',['rootURL','$scope','$rootScope', '$http', 'SettingService', 'UserService', 'GroupService', '$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, UserService, GroupService, $stateParams, $location) {
  $scope.showOptions = true;
  $scope.showGroupSelect = false;
  $scope.showSyncData = false;
  $scope.sync = {update: 'true'}; //this has to exist to stop update being undefined and the select creating and selecting by default a blank row.

  $scope.consoleSync = function() {
    $scope.showOptions = false;
    $scope.showSyncData = true;
    $scope.isConsole = true;
    $scope.hasRoles = true;
    $scope.loadSystemRoles();
  }

 

  $scope.groups = [];
  GroupService.groupList().then(function successCallback(response) {
    angular.forEach(response.data.list, function(c) {
      GroupService.getGroup(c).then(function successCallback(groupResponse) {
        $scope.groups.push({ id: c, name: groupResponse.data.meta.name})
      }, function errorCallback(groupResponse) {
        $rootScope.$broadcast('message-error', 'There was a problem getting group information');
      });
    });
  }, function errorCallback(response) {
    $rootScope.$broadcast('message-error', 'There was a problem getting the group list');
  });



  $scope.createSync = function() {
    $scope.group = {id: $scope.selectedGroup};
    if ($scope.selectedGroup == undefined) {
      $rootScope.$broadcast('message-error', 'Please select a group to populate with the Sync Job');
    } else {
      GroupService.getGroup($scope.selectedGroup).then(function successCallback(response) {
        GroupService.getDefinition(response.data.definition).then(function successCallback(defResponse) {
          $scope.group.data = defResponse.data;
          if (defResponse.data.memberTypes.indexOf('sid') !== -1) {
            $scope.group.isUserGroup = true;
            $scope.loadSystemRoles();
          } else {
            $scope.group.isUserGroup = false;
          }
          $scope.showGroupSelect = false;
          $scope.showSyncData = true;
        }, function errorCallback(defResponse) {
          $rootScope.$broadcast('message-error', 'There was a problem getting the definitions for the group');
        });
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', 'There was a problem getting group information');
      });
    }
  };

  $scope.roleList = [];
  $scope.userTypes = [];
  $scope.showTypes = {};
  $scope.roles = {};
  
  $scope.loadSystemRoles = function() {
    UserService.getSystemRolesList()
      .then(function successCallback(response) {
        $scope.roleList = response.data.list;
        angular.forEach($scope.roleList, function(c) {
           UserService.getRole(c)
             .then(function successCallback(roleresponse) {
               var role = {
                 name: roleresponse.data.name,
                 description: roleresponse.data.description,
                 id: c,
                 parent: roleresponse.data.parent,
                 children: roleresponse.data.children
               };

               function uuid(uuid) {
                 return c == uuid;
               }

               //var index = $scope.roles.findIndex(uuid);
               if (!roleresponse.data.parent) {
                 $scope.userTypes.push(role);
               } else {
                 if (!$scope.roles[role.parent]) {
                   $scope.roles[role.parent] = {};
                 }
                 $scope.roles[role.parent][role.id] = role;
               }
             }, function errorCallback(roleresponse) {
               $rootScope.$broadcast('message-error', 'There was a problem finding available roles');
               $location.path('/users/list');
             });
        });
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', response.data);
      });
  };

  $scope.$watch('user.roles', function (newValue, oldValue, scope) {
      $scope.showTypes = {};
     angular.forEach($scope.user.roles, function(r) {
       $scope.showTypes[r] = {};
       $scope.showTypes[r].show = true;
     });
  },true);


  $scope.submitForm = function() {
    if ($scope.sync.update == "true") {
      $scope.sync.update = true;
    } else {
      $scope.sync.update = false;
    }
    $scope.sync.group = $scope.selectedGroup;
    console.log($scope.sync.group_id);
    SettingService.postSync($scope.sync).then(function successCallback(response) {
        if (response.data.errors) {
        } else {
          $location.path('/settings/sync/list');
          $rootScope.$broadcast('message-success', "Sync Created: " + $scope.sync.name);
        }
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "There was a problem creating the sync job. " + response.data.message);
      });
  };
}]);
