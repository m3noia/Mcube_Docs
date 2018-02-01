app.controller('settings.advanced',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {


  $scope.submitForm = function() {
    $scope.data.hostnames = $scope.data.dns.split(",");
    delete $scope.data.dns;
    SettingService.putSettings($scope.etag,$scope.data)
     .then(function successCallback(response) {
      $rootScope.$broadcast('message-success', "Settings Changed");
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', response.data.message);
    });
    $scope.loadsettings();
  };

  $scope.loadsettings = function() {
    SettingService.settingsList().then(function successCallback(response) {
      $scope.etag = response.headers('ETag');
      $scope.data = response.data;
      $scope.data.dns = $scope.data.hostnames.join();
    }, function errorCallback(response) {
       $rootScope.$broadcast('message-error', response.data);
    });

  };

  $scope.loadsettings();
}]);
