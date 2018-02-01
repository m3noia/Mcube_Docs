app.controller('settings.systemmessages',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {


  $scope.submitForm = function() {
    SettingService.putSystemMessages($scope.etag,$scope.data)
     .then(function successCallback(response) {
      $rootScope.$broadcast('message-success', "System Messages Changed");
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', response.data.message);
    });
    $scope.loadsettings();
  };

  $scope.loadsettings = function() {
    SettingService.getSystemMessages().then(function successCallback(response) {
      $scope.etag = response.headers('ETag');
      $scope.data = response.data;
    }, function errorCallback(response) {
       $rootScope.$broadcast('message-error', response.data.message);
    });
  };

  $scope.loadsettings();
}]);
