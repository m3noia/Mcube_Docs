app.controller('device.list',['rootURL','$scope', '$http', 'DeviceService', function(rootURL, $scope, $http, DeviceService) {

  $scope.loadDeviceList = function() {
    DeviceService.deviceList().then(function successCallback(devices) {
      angular.forEach(devices.data.list, function(c) {
        DeviceService.getDevice(c).then(function successCallback(device) {
          $scope.devices.push(device.data);
        }, function errorCallback(deviceresponse) {
          $rootScope.$broadcast('message-error', "There was a problem getting a devices data "+ deviceresponse.data.message);
        });
      });
    }, function errorCallback(devicesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the device list "+ devicesresponse.data.message);
    });
  };

  $scope.refresh = function() {
    $scope.devices = [];
    $scope.loadDeviceList();
  }

  $scope.devices = [];
  $scope.loadDeviceList();
}]);
