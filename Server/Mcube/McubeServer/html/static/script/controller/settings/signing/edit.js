app.controller('settings.signing.edit',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {
  SettingService.getSigningRule($stateParams.id).then(function successCallback(response) {
    $scope.etag = response.headers('ETag');
    $scope.rule = response.data;

  }, function errorCallback(response) {
    $rootScope.$broadcast('message-error', "There was a problem getting the Signing Rule. " + response.data.message);
  });
  $scope.submitForm = function() {
    SettingService.putSigningRule($scope.etag,$scope.rule).then(function successCallback(response) {
        if (response.data.errors) {
        } else {
          $location.path('/settings/signing/list');
          $rootScope.$broadcast('message-success', "Signing Rule Edited: " + $scope.rule.name);
        }
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "There was a problem Editing the Signing Rule. " + response.data.message);
      });
  };

}]);
