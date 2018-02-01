app.controller('settings.email',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {

  $scope.refetch = function() {
    SettingService.getEmail().then(function successCallback(response) {
      $scope.etag = response.headers('ETag');
      $scope.data = response.data;
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem getting the email settings from the server. " + response.data.message);
    });
  };

  SettingService.getEmail().then(function successCallback(response) {
    $scope.etag = response.headers('ETag');
    $scope.data = response.data;

    $scope.$watch('data.emailViolations', function() {
      if ($scope.data.emailViolations) {
        $scope.notifications_disabled = false;
      } else {
        $scope.notifications_disabled = true;
      }
    });
    $scope.$watch('data.authMethod', function() {
      if ($scope.data.authMethod == 'None') {
        $scope.noauth = true;
        $scope.data.login = '';
        $scope.data.password = '';
        $scope.data.hasPassword = '';
        $scope.passwordplaceholder = '';
      } else {
        $scope.noauth = false;
        if ($scope.data.hasPassword) {
          $scope.passwordplaceholder = 'Leave blank unless changing';
          $scope.needspass = false;
        } else {
          $scope.needspass = true;
          $scope.passwordplaceholder = '';
        }
      }
    });
   
    $scope.submitForm = function() {
      var prepared = {
        authMethod: $scope.data.authMethod,
        connectionType: $scope.data.connectionType,
        emailConnectionTimeout: $scope.data.emailConnectionTimeout,
        emailMessageTimeout: $scope.data.emailMessageTimeout,
        emailResponseTimeout: $scope.data.emailResponseTimeout,
        emailServer: $scope.data.emailServer,
        emailViolations: $scope.data.emailViolations,
        fromEmail: $scope.data.fromEmail,
        fromName: $scope.data.fromName,
        localDomain: $scope.data.localDomain,
        port: $scope.data.port,
        toEmail: $scope.data.toEmail
      };
      if ($scope.data.password) {
        prepared.password = $scope.data.password;
        prepared.login = $scope.data.login;
      }

      SettingService.putEmail($scope.etag,prepared).then(function successCallback() {
        $rootScope.$broadcast('message-success', "Email Settings Changed");
        $scope.refetch();
      }, function errorCallback(putresponse) {
        $rootScope.$broadcast('message-error', "There was a problem changing the settings. " + putresponse.data.message);
        $scope.refetch();
      });
    };
  }, function errorCallback(response) {
    $rootScope.$broadcast('message-error', "There was a problem getting the email settings from the server. " + response.data.message);
  });
}]);
