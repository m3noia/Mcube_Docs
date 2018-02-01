app.controller('topnav',['rootURL','$scope', '$http', 'UserService', '$rootScope','SettingService', function(rootURL, $scope, $http, UserService, $rootScope, SettingService) {

  $scope.logout = function() {
    $http.post(rootURL + '/logout').then(function successCallback(response) {
      $rootScope.$broadcast('event:auth-loginRequired');
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem logging you out. " + response.data.message);
    });
  }
  $scope.$on('login', function(event, user) {
    UserService.getSelf().then(function successCallback(response) {
      $scope.user = response.data;
      $rootScope.user = response.data;
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a fetching your user data from the server. " + response.data.message);
    });
  });

}]);
