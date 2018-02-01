app.controller('device.authenticated',['rootURL','$rootScope','$scope', '$http', 'DeviceService', function(rootURL, $rootScope,$scope, $http, DeviceService) {
  $scope.pagination = { current: 1 };
  $scope.pageSize = 20;


  $scope.pageChanged = function(newPage) {
    $scope.loadDeviceList(20,newPage);
    $scope.listTotal();
  } 

  $scope.listTotal = function() { 
    DeviceService.deviceListCount().then(function successCallback(response) {
      $scope.totalitems = response.data.list.length;
    }, function errorCallback(devicesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the device list "+ devicesresponse.data.message);
    });
  };
  $scope.listTotal();

  $scope.loadDeviceList = function(count,page) { 
    $rootScope.$broadcast('server-loading');
    DeviceService.deviceList(count,page).then(function successCallback(devices) {
      $scope.devices = devices.data.list;
      angular.forEach(devices.data.list, function(c) {
        DeviceService.getDevice(c).then(function successCallback(device) {
          device.data.ETag = device.headers('ETag');
          function uuid(uuid) {
            return c == uuid;
          }
          var index = $scope.devices.findIndex(uuid);
          $scope.devices[index] = device.data;
        }, function errorCallback(devicesresponse) {
          $rootScope.$broadcast('message-error', "There was a problem getting the device info "+ deviceresponse.data.message);
        });
      });
      $rootScope.$broadcast('server-loaded');
    }, function errorCallback(devicesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the device list "+ devicesresponse.data.message);
    });
  };

  $scope.revokeDevice = function(device, idx) {
    DeviceService.revokeDevice(device.id, device.ETag).then(function successCallback(data) {
      $scope.devices.splice(idx, 1); 
      $rootScope.$broadcast('message-success', "Device Revoked: " + device.name);
      $rootScope.$broadcast('device-change');
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem revoking the certificate "+ response.data.message);
    });
  }

  $scope.refresh = function() {
    $scope.loadDeviceList($scope.pageSize,$scope.pagination.current);
    $rootScope.$broadcast('device-change');
    $scope.listTotal();
  }
  $scope.refresh();
}]);
