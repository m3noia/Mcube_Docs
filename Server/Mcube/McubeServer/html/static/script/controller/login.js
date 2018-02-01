(function() {
  'use strict';
  angular.module('login',['http-auth-interceptor'])
  
  .controller('LoginController', function ($rootScope, $scope, $http, $interval, authService, rootURL, UserService) {
      $http.get(rootURL + '/ping').then(function successCallback(response) {
        $rootScope.$broadcast('login');
        authService.loginConfirmed();
        $rootScope.loggedin = true;
      })
    $scope.submit = function() {
      $scope.credentials.realm = 'web';
      $http({
        method: 'POST',
        url: rootURL + '/login',
        data: $scope.credentials,
        headers : {'Content-Type': 'application/x-www-form-urlencoded'},
        timeout : 1000
      })
      .then(function successCallback(response) {
        $rootScope.$broadcast('login');
        authService.loginConfirmed();
        $scope.credentials = null;
        $rootScope.loggedin = true;
        $('.btn-login').html('Login');
      }, function failureCallback(response) {
        $scope.credentials = null;
        $rootScope.loggedin = false;
        $rootScope.loginerror = 'Login Failed: There was a problem communicating with the server '+response.data.message;
        $scope.logout();
        $('.btn-login').html('Login');
      });
    };
    $scope.logout = function() {
      $http.post(rootURL + '/logout').success(function() {
        $rootScope.$broadcast('event:auth-loginRequired');
        $rootScope.loggedin = false;
      });
    }
    $scope.timers = function() {
      var serverInfoInterval =  $interval(function() {
        return $http({
                 url: rootURL + '/server/licence/info',
                 method: 'GET',
                 timeout: 30000,
               }).then(function successCallback(response) {
          $rootScope.$broadcast('licencechange', response.data);
        }, function failureCallback(response) {
          $rootScope.$broadcast('licencechange', response.data);
        })
      }, 10000);
      $scope.$on('server-error', function() {
        $interval.cancel(serverInfoInterval);
      });
    };
    $scope.timers();
    $scope.$on('restartTimers', function() {
      $scope.timers();
    });
  });
})();
