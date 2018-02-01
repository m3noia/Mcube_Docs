app.controller('user.create',['rootURL','$scope', '$rootScope', '$http', 'UserService','$location', function(rootURL, $scope, $rootScope, $http, UserService, $location) {

  $scope.show = {};
  $scope.roleList = [];
  $scope.userTypes = [];
  $scope.showTypes = {};
  $scope.roles = {};
  $scope.next = function(stage) {
    $scope.show.details = false;
    $scope.show.roles = false;

    $scope.show[stage] = true;
  }   

  $scope.next('details');

  $scope.user = {};
  $scope.roles = []; 
  $scope.user.disabled = false;
  $scope.createduser = null;
  $scope.submitUserForm = function() {
    UserService.postUser($scope.user).then(function successCallback(response) {
      $scope.next('roles');
      $scope.createduser = response.data.id;
      $rootScope.$broadcast('message-success', "User Created: " + $scope.user.username);

    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem creating the user: "+ response.data.message); 
    });
  };
         
  $scope.submitRoleForm = function() {
    $scope.userroles = [];
    console.log($scope.user.roles);
    if ($scope.user.roles !== undefined) {
      $scope.userroles = $scope.userroles.concat($scope.user.roles);
    }
    delete $scope.user.roles;
    UserService.getUserRoles($scope.createduser).then(function successCallback(roleresponse) {
      $scope.etag = roleresponse.headers('ETag');
      UserService.putRoles($scope.createduser,$scope.userroles,$scope.etag).then(function(putroleresponse) {
        $location.path('/users/list');
      }, function errorCallback(putroleresponse) {
        $rootScope.$broadcast('message-error', "There was an error assigning the requested roles. "+ putroleresponse.data.message); 
      });
    }, function errorCallback(roleresponse) {
      $rootScope.$broadcast('message-error', "There was an error collecting the revision of user roles "+ roleresponse.data.message); 
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
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', response.data);
      });
  };

  $scope.$watch('user.roles', function (newValue, oldValue, scope) {
      $scope.showTypes = {};
     angular.forEach($scope.user.roles, function(r) {
       $scope.showTypes[r] = {};
       $scope.showTypes[r].show = true;
     });
  },true);

  $scope.loadSystemRoles();

}]);
