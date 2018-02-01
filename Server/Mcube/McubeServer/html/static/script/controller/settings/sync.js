app.controller('settings.sync',['rootURL','$scope','$rootScope', '$http', 'SettingService', '$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {
  $scope.syncs = []; 
  $scope.syncList = function() {
    SettingService.syncList().then(function successCallback(response) {
      angular.forEach(response.data.list, function(c) {
        SettingService.getSync(c).then(function successCallback(response) {
          $scope.syncs.push(response.data);
        }, function errorCallback(response) {
          $rootScope.$broadcast('message-error', "There was a problem retrieving a sync job. " + response.data.message);
        });
      });
    }, function errorCallback(response) {
      if (response.data.error == 'genericNotImplimented') {
        $scope.notImplimented = true;
      } else {
        $rootScope.$broadcast('message-error', "There was a problem retrieving the sync job list. " + response.data.message);
      }
    });
  };

  $scope.refresh = function() {
    $scope.syncs = [];
    $scope.syncList();
  }

  $scope.syncs = [];
  $scope.syncList();

  $scope.run = function(uuid) {
    $scope.syncs = [];
    SettingService.syncRun(uuid).then(function successCallback(response) {
      $scope.syncList();
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem asking the server to run a sync: " + response.data.message);
    });
  };

  $scope.deleteSync = function(sync, idx) {
    SettingService.deleteSync(sync).then(function successCallback(data) {
      $scope.refresh();
      $rootScope.$broadcast('message-success', "Deleted Sync");
    }, function errorCallback(response) {
      $scope.refresh();
      $rootScope.$broadcast('message-error', "There was a problem deleting the Sync: "+ response.data.message);
    });
  }
}]);
