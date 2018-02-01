app.controller('device.requests',['rootURL','$rootScope','$scope', '$http', 'DeviceService','$filter','$location', function(rootURL, $rootScope, $scope, $http, DeviceService, $filter, $location) {
  $scope.pagination = { current: 1 };
  $scope.pageSize = 20;
  $scope.canAcceptAll = true;
  $scope.cancel = false;
  $scope.stats = {
    percent: 0,
    total: 'Calculating',
    done: 0
  };
  $scope.pageChanged = function(newPage) {
    $scope.loadCertificateList(20,newPage);
    $scope.listTotal();
  }

  $scope.listTotal = function() {
    DeviceService.certificateRequestListCount('new').then(function successCallback(response) {
      $scope.totalitems = response.data.list.length;
    }, function errorCallback(certificatesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the certificate list "+ certificatesresponse.data.message);
    });
  };
  $scope.listTotal();

  $scope.loadCertificateList = function(count,page) {
    $rootScope.$broadcast('server-loading');
    DeviceService.certificateRequestList('new', count, page).then(function successCallback(certificates) {
      $scope.certificates = certificates.data.list;
      angular.forEach(certificates.data.list, function(c) {
        DeviceService.getCertificateRequest(c).then(function successCallback(certificate) {
          certificate.data.ETag = certificate.headers('ETag');
          function uuid(uuid) {
            return c == uuid;
          }
          var index = $scope.certificates.findIndex(uuid);
          $scope.certificates[index] = certificate.data;
        }, function errorCallback(certificateresponse) {
          $rootScope.$broadcast('message-error', "There was a problem getting the certificate info "+ certificateresponse.data.message);
        });
      });
      $rootScope.$broadcast('server-loaded');
    }, function errorCallback(certificatesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the certificate list "+ certificatesresponse.data.message);
    });
  };

  $scope.signCertificateRequest = function(request, isBatch) {
    DeviceService.signCertificateRequest(request.id, request.ETag).then(function successCallback(data) {
      if (!isBatch) {
        $scope.refresh();
        $rootScope.$broadcast('message-success', "Request Accepted: " + request.commonName);
      }
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem signing the request "+ response.data.message);
    });
  }

  $scope.rejectCertificateRequest = function(request) {
    DeviceService.rejectCertificateRequest(request.id, request.ETag).then(function successCallback(data) {
      $scope.refresh();
      $rootScope.$broadcast('message-warning', "Request Rejected: " + request.commonName);
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem rejecting the request "+ response.data.message);
    });
  }

  $scope.acceptAll = function() {
    $scope.showStats = true;
    $scope.cancel = false;
    $scope.stats = {
      percent: 0,
      total: 'Calculating',
      done: 0
    };
    var certList = [];
    DeviceService.certificateRequestListAll('new').then(function successCallback(certificates) {
      certList = certificates.data.list;
      if (!certList.length) {
        $scope.showStats = false;
        $scope.refresh();
        return;
      }
      var total = certList.length;
      var done = 0;
      var isBatch = true;
      var data = { lifespan: 365 };

      $scope.signBulk = function() {
        var cert = certList[0];
        if ($scope.cancel) {
          $scope.refresh();
          $scope.showStats = false;
          $rootScope.$broadcast('message-success', "The requested certificates have been signed");
          return;
        }
        DeviceService.getCertificateRequest(cert).then(function successCallback(certificate) {
          certificate.data.ETag = certificate.headers('ETag');
          DeviceService.signCertificateRequestTest(certificate.data.id, certificate.data.ETag).then(function successCallback() { 
            certList.splice(0,1);
            done++;
            $scope.stats = {
              percent: Math.ceil((done/total)*100),
              total: total,
              done: done
            };
  
            if (certList.length) {
              $scope.signBulk();
            } else {
              $scope.showStats = false;
              $scope.refresh();
              $rootScope.$broadcast('message-success', "The requested certificates have been signed");
            }
          }, function errorCallback(certificates) {
            $rootScope.$broadcast('message-error', "There was a problem signing a certificate "+ certificates.data.message);
            $scope.refresh();
            $scope.showStats = false;
          });
        });
      }
      if (certList.length) {
        $scope.signBulk();
      } else {
        $scope.refresh();
      }
    }, function errorCallback(certificates) {
      $rootScope.$broadcast('message-error', "There was a problem getting the certificate list "+ certificates.data.message);
      $scope.showStats = false;
      $scope.refresh();
    });
  };


  $scope.refresh = function() {
    $scope.loadCertificateList($scope.pageSize,$scope.pagination.current);
    $rootScope.$broadcast('device-change');
    $scope.listTotal();
    $scope.stats = {
      percent: 0,
      total: 'Calculating',
      done: 0
    };
  }

  $scope.refresh();

}]);
