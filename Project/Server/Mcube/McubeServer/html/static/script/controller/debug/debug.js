app.controller('debug',['rootURL','$scope','$rootScope', '$http', 'DebugService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, DebugService, $stateParams, $location) {

  $scope.getrootendpoint = function(endpoint) {
    var rest = endpoint.substring(0, endpoint.lastIndexOf("/") + 1);
    var last = endpoint.substring(endpoint.lastIndexOf("/") + 1, endpoint.length);
    $scope.data.endpoint = rest.replace(/\/([^\/]*)$/,'$1');
  };
  
  $scope.fetchEndpoint = function() {
    $scope.error = null;
    $scope.data.json = null;
    $scope.etag = null;
    if ($scope.data.endpoint == '' || $scope.data.endpoint == '/') {
      $scope.error = 'Cannot get this url';
    } else {
      DebugService.getEndpoint($scope.data.endpoint).then(function successCallback(response) {
        $scope.etag = response.headers('ETag');
        var patt = new RegExp("devices\/");
        if (patt.test($scope.data.endpoint)) {
          $scope.extras = ['sessions'];
        }
        $scope.data.json = JSON.stringify(response.data, null, 2);
        $scope.list = [];
        angular.forEach(response.data, function(value,key) {
          if (key == 'list') {
            angular.forEach(value, function(v,k) {
              $scope.list.push(v);
            });
          }
        });
      }, function errorCallback(response) {
         $scope.list = [];
        $scope.error = JSON.stringify(response.data, null, 2);
      });
    }
  };
  $scope.sendJson = function() {
    DebugService.putEndpoint($scope.etag,$scope.data.endpoint,$scope.data.json).then(function successCallback(response) { 
      $scope.error = null;
    }, function errorCallback(response) {
      $scope.error = JSON.stringify(response.data, null, 2);
    });
  };
  $scope.deleteEndpoint = function() {
    DebugService.deleteEndpoint($scope.etag,$scope.data.endpoint).then(function successCallback(response) { 
      $scope.error = null;
      $scope.fetchEndpoint();
    }, function errorCallback(response) {
      $scope.error = JSON.stringify(response.data, null, 2);
    });
  };

  
}]);
