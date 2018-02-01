app.controller('device',['rootURL','$scope', '$http', 'DeviceService', function(rootURL, $scope, $http, DeviceService) {
  $scope.stats = {};
  var requests = function() {
    DeviceService.certificateRequestList('new').then(function successCallback(certificates) {
      $scope.stats.requests = certificates.data.list.length;    
    }, function errorCallback(response) {
    });
  };

  var authed = function() {  
    DeviceService.deviceList().then(function successCallback(devices) {
      $scope.stats.authenticated = devices.data.list.length;    
    }, function errorCallback(response) {
    });
  };

  var rejected = function() {
    DeviceService.certificateRequestList('rejected').then(function successCallback(certificates) {
      $scope.stats.rejected = certificates.data.list.length;    
    }, function errorCallback(response) {
    });

  };

  var revoked = function() {
    DeviceService.deviceCRLList().then(function successCallback(devices) {
      $scope.stats.revoked = devices.data.list.length;    
    }, function errorCallback(response) {
    });

  };

  $scope.$on('device-change', function() {
    requests();
    authed();
    rejected();
    revoked();
  });

  requests();
  authed();
  rejected();
  revoked();
}]);
