app.controller('settings.signing.create',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {
  $scope.rule = {};
  $scope.submitForm = function() {
    SettingService.postSigningRule($scope.rule).then(function successCallback(response) {
        if (response.data.errors) {
        } else {
          $location.path('/settings/signing/list');
          $rootScope.$broadcast('message-success', "Signing Rule Created: " + $scope.rule.name);
        }
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "There was a problem creating the Signing Rule. " + response.data.message);
      });
  };
  SettingService.settingsList().then(function successCallback(response) {
    $scope.rule.certificateLifespan = response.data.certificateLifespan;
  }, function errorCallback(response) {
    $rootScope.$broadcast('message-error', "There was a problem retrieving a defaults. " + response.data.message);
  });
}]);
