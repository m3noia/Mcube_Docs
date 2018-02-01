app.controller('nav',['rootURL','$scope', '$http', 'UserService', '$rootScope','SettingService', function(rootURL, $scope, $http, UserService, $rootScope, SettingService) {


  $scope.getLicence = function() {
    SettingService.getLicenceInfo().then(function successCallback(response) {
      $scope.licence = response.data;
      $rootScope.isLicenced = response.data.valid;
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem getting the email settings from the server. " + response.data.message);
    });
  };
  $scope.getLicence();

  $scope.$on('licencechange', function(event, licence) {
    $scope.licence = licence;
  });
  $scope.$on('licencechangeFetch', function(event) {
    $scope.getLicence();
  });
  
  $scope.getDebug = function() {
    SettingService.getDebug().then(function successCallback(response) {
      $scope.isDebug = response.data.webDebug;
    });
  };

  $scope.getDebug();
   
}]);
