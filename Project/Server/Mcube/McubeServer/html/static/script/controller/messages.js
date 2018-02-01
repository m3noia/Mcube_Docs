app.controller('messagesController',['$scope','$rootScope', function($scope,$rootScope) {
  $scope.$on('message-success', function(event, msg) {
    $scope.successmsg = msg;
  });
  $scope.$on('message-warning', function(event, msg) {
    $scope.warningmsg = msg;
  });
  $scope.$on('message-error', function(event, msg) {
    $scope.errormsg = msg;
  });
  $scope.$on('event:auth-forbidden', function(event, msg) {
    $scope.errormsg = msg;
  });
  $rootScope.$on('$viewContentLoaded', function(event) {
      $scope.successmsg = null;
      $scope.warningmsg = null;
      $scope.errormsg = null;
  });
  $rootScope.$on('$stateChangeStart', function(evt, cur, prev) {
    $scope.success = null;
    $scope.warning = null;
    $scope.error = null;
  });
}]);
app.controller('server',['$scope','$rootScope','$state','rootURL','$http', function($scope,$rootScope,$state,rootURL,$http) {
  $scope.$on('server-error', function(event, msg) {
    $scope.communicationerror = true;
  });
  $scope.reconnect = function() {
    $http({
      url: rootURL + '/ping',
      method: 'GET',
      timeout: 30000,
    }).then(function successCallback(response) {
      $scope.communicationerror = false;
      $state.go($state.current, {}, {reload: true});
      $rootScope.$broadcast('restartTimers');
    });
  };
  
  $scope.$on('server-loading', function(event, msg) {
    $scope.loading = true;
  });
  $scope.$on('server-loaded', function(event, msg) {
    $scope.loading = false;
  });
}]);
