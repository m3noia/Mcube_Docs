app.controller('device.revoked',['rootURL','$rootScope','$scope', '$http', 'DeviceService','$filter', function(rootURL, $rootScope, $scope, $http, DeviceService, $filter) {
  $scope.pagination = { current: 1 };
  $scope.pageSize = 20;

  $scope.pageChanged = function(newPage) {
    $scope.loadDeviceList(20,newPage);
    $scope.listTotal();
  }

  $scope.listTotal = function() {
    DeviceService.deviceCRLList().then(function successCallback(response) {
      $scope.totalitems = response.data.list.length;
    }, function errorCallback(certificatesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the certificate list "+ certificatesresponse.data.message);
    });
  };
  $scope.listTotal();

  $scope.loadDeviceList = function(count,page) {
    $rootScope.$broadcast('server-loading');
    DeviceService.deviceCRLList(count,page).then(function successCallback(devices) {
      $scope.devices = devices.data.list;
      angular.forEach(devices.data.list, function(c) {
        DeviceService.getDevice(c).then(function successCallback(device) {
          device.data.etag = device.headers('ETag');
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

 $scope.unRevokeDevice = function(request, etag) {
    DeviceService.unRevokeDevice(request.id, etag).then(function successCallback(devices) {
      $scope.refresh();
      $rootScope.$broadcast('device-change');
      $rootScope.$broadcast('message-success', "Device Unrevoked")
    }, function errorCallback(devicesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem unrevoking the device "+ devicesresponse.data.message);
    });
  };
  
  $scope.refresh = function() {
    $scope.loadDeviceList($scope.pageSize,$scope.pagination.current);
    $rootScope.$broadcast('device-change');
    $scope.listTotal();
  }

  $scope.refresh();

}]);
