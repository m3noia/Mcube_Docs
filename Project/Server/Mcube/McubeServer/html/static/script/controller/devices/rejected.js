app.controller('device.rejected',['rootURL','$rootScope','$scope', '$http', 'DeviceService','$filter', function(rootURL, $rootScope, $scope, $http, DeviceService, $filter) {
  $scope.pagination = { current: 1 };
  $scope.pageSize = 20;

  $scope.pageChanged = function(newPage) {
    $scope.loadCertificateList(20,newPage);
    $scope.listTotal();
  }

  $scope.listTotal = function() {
    DeviceService.certificateRequestListCount('rejected').then(function successCallback(response) {
      $scope.totalitems = response.data.list.length;
    }, function errorCallback(devicesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the device list "+ devicesresponse.data.message);
    });
  };
  $scope.listTotal();
  
  $scope.loadCertificateList = function(count,page) {
    $rootScope.$broadcast('server-loading');
    DeviceService.certificateRequestList('rejected',count,page).then(function successCallback(certificates) {
      $scope.certificates = certificates.data.list;
      angular.forEach(certificates.data.list, function(c) {
        DeviceService.getCertificateRequest(c).then(function successCallback(certificate) {
          certificate.data.ETag = certificate.headers('ETag');
          function uuid(uuid) {
            return c == uuid;
          }
          var index = $scope.certificates.findIndex(uuid);
          $scope.certificates[index] = certificate.data; 

        }, function errorCallback(response) {
          $rootScope.$broadcast('message-error', "There was a problem getting the list "+ response.data.message);
        });
      });
      $rootScope.$broadcast('server-loaded');
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem getting the list "+ response.data.message);
    });
  };

  $scope.unrejectCertificateRequest = function(request, idx) {
    DeviceService.unrejectCertificateRequest(request.id, request.ETag).then(function successCallback(certificates) {
      $scope.refresh();
      $rootScope.$broadcast('device-change');
      $rootScope.$broadcast('message-success', "Unrejected: " + request.commonName);
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem unrejecting the certificate request "+ response.data.message);
    });
  }

  $scope.refresh = function() {
    $scope.loadCertificateList($scope.pageSize,$scope.pagination.current);
    $rootScope.$broadcast('device-change');
    $scope.listTotal();
  }

  $scope.refresh();

}]);
