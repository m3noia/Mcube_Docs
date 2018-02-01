app.controller('settings.sync.edit',['rootURL','$scope','$rootScope', '$http', 'SettingService', 'UserService','GroupService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, UserService, GroupService, $stateParams, $location) {
  $scope.roles = [];
  $scope.loadSystemRoles = function() {
    UserService.getSystemRolesList()
      .then(function successCallback(response) {
        angular.forEach(response.data.list, function(c) {
           UserService.getRole(c)
             .then(function sucessClassback(roleresponse) {
               var role = {
                 name: roleresponse.data.name,
                 description: roleresponse.data.description,
                 id: c,
               };
               $scope.roles.push(role);
             }, function errorCallback(roleresponse) {
               $rootScope.$broadcast('message-error', 'There was a problem finding available roles');
               $location.path('/settings/sync/list');
             });
        });
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', response.data);
      });
  };

  SettingService.getSync($stateParams.id).then(function successCallback(response) {
    $scope.etag = response.headers('ETag');
    $scope.sync = response.data;
    $scope.updatetype = response.data.update;

    if ($scope.sync.update) {
      $scope.sync.update = 'true';
    } else {
      $scope.sync.update = 'false';
    }

    $scope.group = {};

    GroupService.getGroup($scope.sync.group_id).then(function successCallback(response) {
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

   

    $scope.submitForm = function() {
      if ($scope.sync.update == 'true') {
        $scope.sync.update = true;
      } else {
        $scope.sync.update = false;
      }

      SettingService.putSync($scope.etag,$stateParams.id,$scope.sync).then(function successCallback(response) {
        if (response.data.errors) {
        } else {
          $location.path('/settings/sync/list');
          $rootScope.$broadcast('message-success', "Sync Edited: " + $scope.sync.name);
        }
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "There was a problem editing the sync job. " + response.data.message);
      });
    };
  });
}]);
