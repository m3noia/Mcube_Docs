app.controller('devicesettings.security',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {


  $scope.submitForm = function() {
    SettingService.putDeviceGlobal($scope.etag,$scope.data)
     .then(function successCallback(response) {
      $rootScope.$broadcast('message-success', "Device Security Settings Changed");
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', response.data.message);
    });
    $scope.loadsettings();
  };

  $scope.loadsettings = function() {
    SettingService.getDeviceGlobal().then(function successCallback(response) {
      $scope.etag = response.headers('ETag');
      $scope.data = response.data;
    }, function errorCallback(response) {
       $rootScope.$broadcast('message-error', response.data.message);
    });
  };

  $scope.loadsettings();
}]);
