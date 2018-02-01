app.controller('settings.proxy',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {

  $scope.getProxy = function() {
    SettingService.getProxy().then(function successCallback(response) {
      $scope.data = response.data
      $scope.etag = response.headers('ETag');
      if ($scope.data.hasPassword) {
        $scope.passwordplaceholder = 'Leave blank unless changing';
        $scope.needspass = false;
      } else {
        $scope.needspass = true;
        $scope.passwordplaceholder = '';
      }

    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "We were unable to get the proxy information, the error was: "+response.data.message);
    });
  };
  $scope.getProxy();

  $scope.$watch('useProxy', function() {
    if (!$scope.useProxy) {
      $scope.data.hostname = '';
      $scope.data.authRequired = false;
    }
  });

  $scope.$watch('data.authRequired', function() {
    if (!$scope.data.authRequired) {
      $scope.data.username = '';
      $scope.data.password = '';
    }
  });

  $scope.$watch('data.hostname', function() {
    if ($scope.data.hostname == '') {
      $scope.useProxy = false;
      $scope.data.authRequired = false;
    } else {
      $scope.useProxy = true;
    }
  });

  $scope.submitForm = function() {
     delete $scope.data.hasPassword;
     if (!$scope.data.authRequired) {
       delete $scope.data.username;
       delete $scope.data.password;
     }
     SettingService.putProxy($scope.etag, $scope.data).then(function successCallback(response) {
      $scope.getProxy();
      $rootScope.$broadcast('message-success', "Proxy Settings Saved");
    }, function errorCallback(response) {
      $scope.getProxy();
      $rootScope.$broadcast('message-error', "There was a problem saving the proxy settings: "+response.data.message);
    });
  };

}]);
