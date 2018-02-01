app.controller('user.list',['rootURL','$scope', '$http', 'UserService', '$rootScope', function(rootURL, $scope, $http, UserService,$rootScope) {
  $scope.users = [];
  $scope.loadUserList = function() {
    UserService.userList().then(function successCallback(users) {
      $scope.users = users.data.list;
      angular.forEach(users.data.list, function(c) {
        UserService.getUser(c).then(function successCallback(user) {
          user.data.etag = user.headers('ETag');
          function uuid(uuid) {
            return c == uuid;
          }
          var index = $scope.users.findIndex(uuid);
          $scope.users[index] = user.data;   

        }, function errorCallback(userresponse) {
          $rootScope.$broadcast('message-error', "There was a problem getting the user info "+ userresponse.data.message);
        });
      });
    }, function errorCallback(usersresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the users list "+ usersresponse.data.message);
    });
  };
  $scope.deleteUser = function(user, idx) {
    UserService.deleteUser(user).then(function successCallback(data) {
      $scope.refresh();
      $rootScope.$broadcast('message-success', "Deleted User");
    }, function errorCallback(response) {
      $scope.refresh();
      $rootScope.$broadcast('message-error', "There was a problem deleting the user: "+ response.data.message);
    });
  }
  $scope.is_self = function(id) {
    if ($rootScope.user.id === id) {
     return 1;
    };
  };
  $scope.refresh = function() {
    $scope.users = [];
    $scope.loadUserList();
  }

  $scope.users = [];
  $scope.loadUserList();
}]);
