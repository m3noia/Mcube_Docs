app.controller('user.edit',['rootURL','$scope','$rootScope', '$http', 'UserService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, UserService, $stateParams, $location) {

  $scope.roleList = [];
  $scope.userTypes = [];
  $scope.showTypes = {};
  $scope.roles = {};
  $scope.getUser = function() {
    UserService.getUser($stateParams.id)
      .then(function successCallback(response) {
        $scope.uetag = response.headers('ETag');
        $scope.user = response.data;
        if ($scope.user.contexts && $scope.user.contexts.length) {
          $scope.stringMatch = true;
        } else {
          $scope.stringMatch = false;
        }
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', response.data.message); 
      });
  };
  $scope.getUser();

  $scope.getUserRoles = function() {
    UserService.getUserRoles($stateParams.id)
      .then(function successClassback(response) {
        $scope.retag = response.headers('ETag');
        $scope.user.roles = response.data.list;
        
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', error.error); 
      });
  };

  $scope.loadSystemRoles = function() {
    UserService.getSystemRolesList()
      .then(function successCallback(response) {
        $scope.roleList = response.data.list;
        angular.forEach($scope.roleList, function(c) {
           UserService.getRole(c)
             .then(function successCallback(roleresponse) {
               var role = {
                 name: roleresponse.data.name,
                 description: roleresponse.data.description,
                 id: c,
                 parent: roleresponse.data.parent,
                 children: roleresponse.data.children
               };

               function uuid(uuid) {
                 return c == uuid;
               }

               //var index = $scope.roles.findIndex(uuid);
               if (!roleresponse.data.parent) {
                 $scope.userTypes.push(role);
               } else {
                 if (!$scope.roles[role.parent]) {
                   $scope.roles[role.parent] = {};
                 }
                 $scope.roles[role.parent][role.id] = role;
               }
             }, function errorCallback(roleresponse) { 
               $rootScope.$broadcast('message-error', 'There was a problem finding available roles');
               $location.path('/users/list');
             });
        });
        $scope.getUserRoles();
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', response.data);
      });
  };

  $scope.loadSystemRoles();


  $scope.submitForm = function() {
    var prepared = {
     firstname: $scope.user.firstname,
     lastname: $scope.user.lastname,
     username: $scope.user.username,
     disabled: $scope.user.disabled,
     externalAuth: $scope.user.externalAuth,
     contexts: []
    };
    if ($scope.stringMatch) {
      prepared.contexts = [
        {   
            "type": "UPN"
        },
        {   
            "type": "NetBIOS"
        },
        {   
            "type": "local"
        }
      ];
    } else {
      prepared.contexts = [];
    }
    if ($scope.user.password) {
     prepared.password = $scope.user.password;
    }
    UserService.putUser($stateParams.id, prepared, $scope.uetag).then(function successCallback(response) {
      UserService.putRoles($stateParams.id,$scope.user.roles,$scope.retag).then(function successCallback(role) {
        $rootScope.$broadcast('message-success', "User Edited: " + $scope.user.username);
        $scope.roleList = [];
        $scope.userTypes = [];
        $scope.showTypes = {};
        $scope.roles = {};
        $scope.getUser();
        $scope.loadSystemRoles();
      }, function errorCallback(role) {
        $rootScope.$broadcast('message-error', "There was a problem updating the users roles. " + role.data.message); 
      });
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem updating the user. " + response.data.message); 
    });
    
  };


  $scope.$watch('user.roles', function (newValue, oldValue, scope) {
      $scope.showTypes = {};
     angular.forEach($scope.user.roles, function(r) {
       $scope.showTypes[r] = {};
       $scope.showTypes[r].show = true;
     });
  },true);


}]);




