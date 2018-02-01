app.controller('dash',['rootURL', '$rootScope','$scope', '$http', '$interval', 'UserService','DeviceService','SessionService','SettingService', function(rootURL, $rootScope, $scope, $http, $interval,UserService,DeviceService,SessionService,SettingService) {

  $scope.isLicenced = false;
  $scope.hasUsers = false;
  $scope.hasClients = false;
  $scope.showWelcome = false;

  DeviceService.certificateRequestList('new').then(function successCallback(certificates) {
    $scope.requestcount = certificates.data.list.length;
  }, function errorCallback(response) {
    $scope.requestcount = 'Data Unavailable';
  });
  DeviceService.deviceList().then(function successCallback(requests) {
    $scope.certificatecount = requests.data.list.length;
  }, function errorCallback(response) {
    $scope.certificatecount = 'Data Unavailable';
  });
  UserService.userList().then(function successCallback(users) {
    $scope.usercount = users.data.list.length;
    if ($scope.usercount == 1) {
      $scope.showWelcome = true;
    } else {
      $scope.hasUsers = true;
    }
  }, function errorCallback(response) {
    $scope.usercount = 'Data Unavailable';
  });
  DeviceService.deviceList().then(function successCallback(devices) {
    $scope.devicecount = devices.data.list.length;
    if ($scope.devicecount == 0) {
      $scope.showWelcome = true;
    } else {
      $scope.hasClients = true;
    }
  }, function errorCallback(response) {
    $scope.devicecount = 'Data Unavailable';
  });
  SessionService.sessionList().then(function successCallback(sessions) {
    $scope.sessioncount = sessions.data.list.length;
  }, function errorCallback(response) {
    $scope.sessioncount = 'Data Unavailable';
  });
  SettingService.getServerInfo().then(function successCallback(response) {
    $rootScope.$broadcast('server-info', response.data); 
    $scope.server = response.data;
  }, function errorCallback(response) {
    $scope.server = 'Data Unavailable';
  });


  SettingService.getLicenceInfo().then(function successCallback(response) {
    if (response.data.valid) {
      $scope.isLicenced = true;
    } else {
      $scope.showWelcome = true;
    }
  });

  $scope.$on('server-info', function(event, info) {
    SettingService.getLatestVersion().then(function successCallback(response) {
      $scope.latestVersion = response.data.latestVersion;
      var numbers = [info.majorVersion,info.minorVersion,info.patchVersion];
      var currentVersion = numbers.join('.');
      if ($scope.latestVersion != currentVersion) {
        $scope.updateAvaliable = true;
        $scope.update = response.data;
      }
    });
  });
}]);

app.controller('stats',['rootURL', '$rootScope','$scope', '$http', '$interval', function(rootURL, $rootScope, $scope, $http, $interval) {
  $scope.httprps = [];
  $scope.labels = [];
  for (i=0; i < 61; i++) { 
    $scope.httprps.push(0);
    $scope.labels.push('');
  }
  var requestsps = function() {
    $scope.series = ['HTTP Requests Per Second'];
    $scope.onClick = function (points, evt) {
      console.log(points, evt);
      $scope.datasetOverride = [{ 
        yAxisID: 'y-axis-1',
      }];
    };
$scope.colors = [{
        backgroundColor: 'rgba(77,83,96,0.2)',
        pointBackgroundColor: 'rgba(77,83,96,0.6)',
        pointHoverBackgroundColor: 'rgba(77,83,96,1)',
        borderColor: 'rgba(77,83,96,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,0.8)'
  }];
    $scope.options = {
      animation:false,
      elements: {
       line: {
          tension:0,
          fill:true,
          borderWidth:3,
        }
      },
      scales: {
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { beginAtZero:true},
          },
        ]
      }
    };
  };
  requestsps();
  $scope.updateperiod = 1;
  $scope.timers = function() {
    var statsInterval =  $interval(function() {
      return $http({
               url: rootURL + '/server/stats',
               method: 'GET',
               timeout: 1000,
      }).then(function successCallback(response) {
        if ($scope.httprps.length > 60) {
          $scope.httprps.shift();
        }
        var d = new Date();
        var t = d.getTime();

        $scope.httprps.push(response.data.requests);
      }, function failureCallback(response) {
        $scope.httprps.push(0);
      })
    }, 1000);
    $scope.$on('server-error', function() {
      $interval.cancel(statsInterval);
    });
  };
  $scope.timers();
 
}]);
