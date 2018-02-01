app.controller('dash',['rootURL','$scope', '$http', 'UserService','DeviceService','SessionService','SettingService', function(rootURL, $scope, $http, UserService,DeviceService,SessionService,SettingService) {
  DeviceService.certificateRequestList('new').then(function successCallback(certificates) {
    $scope.requestcount = certificates.data.list.length;
  }, function errorCallback(response) {
    $scope.requestcount = 'Data Unavailable';
  });
  DeviceService.certificateList().then(function successCallback(requests) {
    $scope.certificatecount = requests.data.list.length;
  }, function errorCallback(response) {
    $scope.certificatecount = 'Data Unavailable';
  });
  UserService.userList().then(function successCallback(users) {
    $scope.usercount = users.data.list.length;
  }, function errorCallback(response) {
    $scope.usercount = 'Data Unavailable';
  });
  DeviceService.deviceList().then(function successCallback(devices) {
    $scope.devicecount = devices.data.list.length;
  }, function errorCallback(response) {
    $scope.devicecount = 'Data Unavailable';
  });
  SessionService.sessionList().then(function successCallback(sessions) {
    $scope.sessioncount = sessions.data.list.length;
  }, function errorCallback(response) {
    $scope.sessioncount = 'Data Unavailable';
  });
  SettingService.getServerInfo().then(function successCallback(response) {
    $scope.server = response.data;
  }, function errorCallback(response) {
    $scope.server = 'Data Unavailable';
  });
}]);
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
}]);
app.controller('device.authenticated',['rootURL','$scope', '$http', 'DeviceService', function(rootURL, $scope, $http, DeviceService) {
 
  $scope.loadDeviceList = function() { 
    DeviceService.deviceList().then(function successCallback(devices) {
      angular.forEach(devices.data.list, function(c) {
        DeviceService.getDevice(c).then(function successCallback(device) {
          $scope.devices.push(device.data);
        }, function errorCallback(devicesresponse) {
          $rootScope.$broadcast('message-error', "There was a problem getting the device info "+ deviceresponse.data.message);
        });
      });
    }, function errorCallback(devicesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the device list "+ devicesresponse.data.message);
    });
  };

  $scope.revokeDevice = function(device, idx) {
    DeviceService.revokeDevice(device.id, device.ETag).then(function successCallback(data) {
      $scope.devices.splice(idx, 1); 
      $rootScope.$broadcast('message-success', "Device Revoked: " + device.name);
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem revoking the certificate "+ response.data.message);
    });
  }

  $scope.refresh = function() {
    $scope.devices = [];
    console.log('foo');
    $scope.loadDeviceList();
  }

  $scope.devices = [];
  $scope.loadDeviceList();
}]);
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
app.controller('device.rejected',['rootURL','$rootScope','$scope', '$http', 'DeviceService','$filter', function(rootURL, $rootScope, $scope, $http, DeviceService, $filter) {
  
  $scope.loadCertificateList = function() {
    DeviceService.certificateRequestList('rejected').then(function successCallback(certificates) {
      angular.forEach(certificates.data.list, function(c) {
        DeviceService.getCertificateRequest(c).then(function successCallback(certificate) {
          certificate.data.ETag = certificate.headers('ETag');
          $scope.certificates.push(certificate.data);
        }, function errorCallback(response) {
          $rootScope.$broadcast('message-error', "There was a problem getting the list "+ response.data.message);
        });
      });
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem getting the list "+ response.data.message);
    });
  };

  $scope.unrejectCertificateRequest = function(request, idx) {
    DeviceService.unrejectCertificateRequest(request.id, request.ETag).then(function successCallback(certificates) {
      $scope.certificates.splice(idx, 1); 
      $rootScope.$broadcast('message-success', "Unrejected: " + request.commonName);
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem unrejecting the certificate request "+ response.data.message);
    });
  }

  $scope.refresh = function() {
    $scope.certificates = [];
    $scope.loadCertificateList();
  }

  $scope.certificates = [];
  $scope.loadCertificateList();

}]);
app.controller('device.requests',['rootURL','$rootScope','$scope', '$http', 'DeviceService','$filter','$location', function(rootURL, $rootScope, $scope, $http, DeviceService, $filter, $location) {
  $scope.currentPage = "1";
  $scope.limit = "20";
  $scope.rowlimits = [
     "20",
     "60",
     "120"
  ]; 
  
  $scope.limit = $scope.rowlimits[0];
  $scope.$watch('limit', function(curVal, oldVal) {
    if (curVal != oldVal) {
      $scope.refresh();    
    }
  });
  $scope.$watch('currentPage', function(curVal, oldVal) {
    if (curVal != oldVal) {
      $scope.refresh();    
    }
  });
  $scope.getPages = function() {
    DeviceService.certificateRequestList('new').then(function successCallback(certificates) {
      $scope.records = certificates.data.list;
      $scope.total = $scope.records.length;
      $scope.totalpages = $scope.total / $scope.limit;
      console.log($scope.total);
      $scope.pages = Array.apply(null, Array(parseInt($scope.totalpages)+1)).map(function (_, i) {return i;});
      $scope.pages.shift();
    }, function errorCallback(certificatesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the certificate list "+ certificatesresponse.data.message);
    });
  };
  $scope.getPages();
  $scope.loadCertificateList = function(count,page) {
    DeviceService.certificateRequestList('new',count,page).then(function successCallback(certificates) {
      $scope.certificates = [];
      angular.forEach(certificates.data.list, function(c) {
        DeviceService.getCertificateRequest(c).then(function successCallback(certificate) {
          certificate.data.ETag = certificate.headers('ETag');
          $scope.certificates.push(certificate.data);
        }, function errorCallback(certificateresponse) {
          $rootScope.$broadcast('message-error', "There was a problem getting the certificate info "+ certificateresponse.data.message);
        });
      });
    }, function errorCallback(certificatesresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the certificate list "+ certificatesresponse.data.message);
    });
  };

  $scope.signCertificateRequest = function(request, idx) {
    DeviceService.signCertificateRequest(request.id, request.ETag).then(function successCallback(data) {
      $scope.certificates.splice(idx, 1); 
      $scope.refresh();
      $rootScope.$broadcast('message-success', "Request Accepted: " + request.commonName);
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem signing the request "+ response.data.message);
    });
  }

  $scope.rejectCertificateRequest = function(request, idx) {
    DeviceService.rejectCertificateRequest(request.id, request.ETag).then(function successCallback(data) {
      $scope.certificates.splice(idx, 1); 
      $scope.refresh();
      $rootScope.$broadcast('message-warning', "Request Rejected: " + request.commonName);
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem rejecting the request "+ response.data.message);
    });
  }

  $scope.signALLCertificateRequests = function(request) {
    angular.forEach($scope.certificates, function (c,index) {
      DeviceService.signCertificateRequest(c.id, c.ETag).then(function successCallback(data) {
        $scope.certificates.splice(index, 1); 
        $rootScope.$broadcast('message-success', "Request Accepted: " + request.commonName);
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "There was a problem signing the request "+ response.data.message);
      });
    });
  }

  $scope.refresh = function() {
    $scope.loadCertificateList($scope.limit,$scope.currentPage);
  }

  $scope.refresh();

}]);
app.controller('device.revoked',['rootURL','$rootScope','$scope', '$http', 'DeviceService','$filter', function(rootURL, $rootScope, $scope, $http, DeviceService, $filter) {

  $scope.loadDeviceList = function() {
    DeviceService.deviceCRLList().then(function successCallback(devices) {
      angular.forEach(devices.data.list, function(c) {
        DeviceService.getDevice(c).then(function successCallback(device) {
          $scope.devices.push(device.data);
        }, function errorCallback(devicesresponse) {
          $rootScope.$broadcast('message-error', "There was a problem getting the device info "+ deviceresponse.data.message);
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
(function() {
  'use strict';
  angular.module('content', [])
  
  .controller('ContentController', function ($scope, $http, $state) {

    $scope.publicContent = [];
    $scope.restrictedContent = [];

    $scope.publicAction = function() {
      $http.post('data/public', $scope.publicData).success(function(response) {
        $scope.publicContent.push(response);
      });
    }

    $scope.restrictedAction = function() {
      $http.post('data/protected', $scope.restrictedData).success(function(response) {
        // this piece of code will not be executed until user is authenticated
        $scope.restrictedContent.push(response);
      });
    }

    $scope.logout = function() {
      $http.post('auth/logout').success(function() {
        $scope.restrictedContent = [];
      });
    }
  });
})();
(function() {
  'use strict';
  angular.module('login',['http-auth-interceptor'])
  
  .controller('LoginController', function ($rootScope, $scope, $http, $interval, authService, rootURL, UserService) {
      $http.get(rootURL + '/ping').then(function successCallback(response) {
        $rootScope.$broadcast('login');
        authService.loginConfirmed();
      })
    $scope.submit = function() {
      $('.btn-login').on('click', function() {
        $(this).html('Please Wait...');
      });
      $scope.credentials.realm = 'web';
      $http({
        method: 'POST',
        url: rootURL + '/login',
        data: $scope.credentials,
        headers : {'Content-Type': 'application/x-www-form-urlencoded'},
        timeout : 5000
      })
      .then(function successCallback(response) {
        $rootScope.$broadcast('login');
        authService.loginConfirmed();
        $scope.credentials = null;
        $('.btn-login').html('Login');
      },function failureCallback(reason, status) {
        $scope.credentials = null;
        $rootScope.loginerror = 'Login Failed: There was a problem communicating with the server '+status;
        $scope.logout();
        $('.btn-login').html('Login');
      });
    };
    $scope.logout = function() {
      $http.post(rootURL + '/logout').success(function() {
        $rootScope.$broadcast('event:auth-loginRequired');
      });
    }

    $scope.timers = function() {
      var serverInfoInterval =  $interval(function() {
        return $http({
                 url: rootURL + '/server/licence/info',
                 method: 'GET',
                 timeout: 30000,
               }).then(function successCallback(response) {
          $rootScope.$broadcast('licencechange', response.data);
        }, function failureCallback(response) {
          $rootScope.$broadcast('licencechange', response.data);
        })
      }, 10000);
      $scope.$on('server-error', function() {
        $interval.cancel(serverInfoInterval);
      });
    };
    $scope.timers();
    $scope.$on('restartTimers', function() {
      $scope.timers();
    });
  });
})();
app.controller('messagesController',['$scope','$rootScope', function($scope,$rootScope) {
  $scope.$on('message-success', function(event, msg) {
    $scope.successmsg = msg;
  });
  $scope.$on('message-warning', function(event, msg) {
    $scope.warningmsg = msg;
  });
  $scope.$on('message-error', function(event, msg) {
    $scope.errormsg = msg;
  });
  $scope.$on('event:auth-forbidden', function(event, msg) {
    $scope.errormsg = msg;
  });
  $rootScope.$on('$viewContentLoaded', function(event) {
      $scope.successmsg = null;
      $scope.warningmsg = null;
      $scope.errormsg = null;
  });
  $rootScope.$on('$stateChangeStart', function(evt, cur, prev) {
    $scope.success = null;
    $scope.warning = null;
    $scope.error = null;
  });
}]);
app.controller('serverError',['$scope','$rootScope','$state','rootURL','$http', function($scope,$rootScope,$state,rootURL,$http) {
  $scope.$on('server-error', function(event, msg) {
    $scope.communicationerror = true;
  });
  $scope.reconnect = function() {
    $http({
      url: rootURL + '/ping',
      method: 'GET',
      timeout: 30000,
    }).then(function successCallback(response) {
      $scope.communicationerror = false;
      $state.go($state.current, {}, {reload: true});
      $rootScope.$broadcast('restartTimers');
    });
  };
}]);
app.controller('nav',['rootURL','$scope', '$http', 'UserService', '$rootScope','SettingService', function(rootURL, $scope, $http, UserService, $rootScope, SettingService) {


  $scope.getLicence = function() {
    SettingService.getLicenceInfo().then(function successCallback(response) {
      $scope.licence = response.data;
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem getting the email settings from the server. " + response.data.message);
    });
  };
  $scope.getLicence();

  $scope.$on('licencechange', function(event, licence) {
    $scope.licence = licence;
  });
  $scope.$on('licencechangeFetch', function(event) {
    $scope.getLicence();
  });

  $scope.logout = function() {
    $http.post(rootURL + '/logout').then(function successCallback(response) {
      $rootScope.$broadcast('event:auth-loginRequired');
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem logging you out. " + response.data.message);
    });
  }
  $scope.$on('login', function(event, user) {
    UserService.getSelf().then(function successCallback(response) {
      $scope.user = response.data;
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a fetching your user data from the server. " + response.data.message);
    });
  });
}]);
app.controller('settings.email',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {

  $scope.refetch = function() {
    SettingService.getEmail().then(function successCallback(response) {
      $scope.etag = response.headers('ETag');
      $scope.data = response.data;
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem getting the email settings from the server. " + response.data.message);
    });
  };

  SettingService.getEmail().then(function successCallback(response) {
    $scope.etag = response.headers('ETag');
    $scope.data = response.data;

    $scope.$watch('data.emailViolations', function() {
      if ($scope.data.emailViolations) {
        $scope.notifications_disabled = false;
      } else {
        $scope.notifications_disabled = true;
      }
    });
    $scope.$watch('data.authMethod', function() {
      if ($scope.data.authMethod == 'None') {
        $scope.noauth = true;
        $scope.data.login = '';
        $scope.data.password = '';
        $scope.data.hasPassword = '';
        $scope.passwordplaceholder = '';
      } else {
        $scope.noauth = false;
        if ($scope.data.hasPassword) {
	  $scope.passwordplaceholder = 'Leave blank unless changing';
          $scope.needspass = false;
        } else {
          $scope.needspass = true;
          $scope.passwordplaceholder = '';
        }
      }
    });
   
    $scope.submitForm = function() {
      var prepared = {
        authMethod: $scope.data.authMethod,
        connectionType: $scope.data.connectionType,
        emailConnectionTimeout: $scope.data.emailConnectionTimeout,
        emailMessageTimeout: $scope.data.emailMessageTimeout,
        emailResponseTimeout: $scope.data.emailResponseTimeout,
        emailServer: $scope.data.emailServer,
        emailViolations: $scope.data.emailViolations,
        fromEmail: $scope.data.fromEmail,
        fromName: $scope.data.fromName,
        localDomain: $scope.data.localDomain,
        port: $scope.data.port,
        toEmail: $scope.data.toEmail
      };
      if ($scope.data.password) {
        prepared.password = $scope.data.password;
        prepared.login = $scope.data.login;
      }

      SettingService.putEmail($scope.etag,prepared).then(function successCallback() {
        $rootScope.$broadcast('message-success', "Email Settings Changed");
        $scope.refetch();
      }, function errorCallback(putresponse) {
        $rootScope.$broadcast('message-error', "There was a problem changing the settings. " + putresponse.data.message);
        $scope.refetch();
      });
    };
  }, function errorCallback(response) {
    $rootScope.$broadcast('message-error', "There was a problem getting the email settings from the server. " + response.data.message);
  });
}]);
app.controller('settings.licence',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location','$timeout', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location,$timeout) {
  $scope.disable = {};


  $scope.getAccounts = function() {
    $scope.lmserror = undefined;
    SettingService.getLMSAccounts($scope.data.email, $scope.data.password).then(function successCallback(response) {
      if (response.data.status == 23) {
        $rootScope.$broadcast('message-error', "Your abtutor.com username and password were not recognised");
        return;
      }
      switch(response.data.status) {
        case 3:
          $scope.lmserror = response.data.Error;
          break;
        case 22:
          if (response.data.Data.length > 1) {
            $scope.accounts = response.data.Data;
            $scope.accountLookup = true;
            $scope.multipleAccounts = true;
          } else {
            $scope.data.key = response.data.Data[0].Serial;
            $scope.data.owner = response.data.Data[0].Acc;
            $scope.owner = true;
            $scope.useKey($scope.data.key, $scope.data.owner);
          }
          break;
      }
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem communicating with the LMS " + response.data.message);
    });
  };

  $scope.resetView = function() {
    $scope.showvalidationType = false;
    $scope.showTrial = false;
    $scope.showFriendlyName = false;
    $scope.showKey = false;
    $scope.showLogin = false;
  };

  SettingService.getLicenceInfo().then(function successCallback(response) {
    $scope.etag = response.headers('ETag');
    console.log($scope.etag);
    $scope.data = response.data;
  }, function errorCallback(response) {
    $rootScope.$broadcast('message-error', "There was a problem getting the licence details " + response.data.message);
  });

  $scope.validationType = function() {
    $scope.resetView();
    $scope.showvalidationType = true;
  }; 
  $scope.validationType(); //Fire the first page

  $scope.useTrial = function() {
    $scope.resetView();
    $scope.showTrial = true;
  }; 

  $scope.setFriendlyName = function() {
    $scope.resetView();
    SettingService.getLicence().then(function successCallback(response) {
      $scope.data = response.data;
    });
    $scope.showFriendlyName = true;
  }; 

  $scope.useKey = function(key,owner) {
    $scope.resetView();
    $scope.showKey = true;
    $scope.data.key = key;
    $scope.data.owner = owner;
  };

  $scope.useLogin = function() {
    $scope.resetView();
    $scope.showLogin = true;
    $scope.accountLookup = true;
  };


  $scope.checkLicence = function() {
    SettingService.getLicenceInfo().then(function successCallback(response) {
      $scope.result = response.data;
      if ($scope.result.lastCheckStatus == 'OK' || $scope.result.lastCheckStatus == 'NewLicenseCreated') {
        $scope.goodResult = 'Licence Validated Successfully'
        $scope.licence = $scope.result;
        $rootScope.$broadcast('licencechange', $scope.result);
        $timeout.cancel($scope.bob);
      } else if ($scope.result.lastCheckStatus == 'errLicenseNotFound') {
        $scope.badResult = 'Sorry we were unable to find a licence with the provided key';
        $timeout.cancel($scope.bob);
      } else if ($scope.result.lastCheckStatus == 'errNoFreeLicenses') {
        $scope.badResult = 'There were no free licences, please login to our website to verify you have free licences.';
        $timeout.cancel($scope.bob);
      } else {
        $scope.badResult = 'There was a problem activating your licence, please contact support. The error was: '+$scope.result.lastCheckStatus;
      };
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem getting the licence details " + response.data.message);
    });
  };

  $scope.i = 0;
  $scope.intervalFunction = function(){
    $scope.bob = $timeout(function() {
      $scope.checkLicence();
      $scope.i++;
      $scope.intervalFunction();
    }, 2000)
  };
  $scope.$watch('i', function() {
    if ($scope.i == 10) {
      $timeout.cancel($scope.bob);
      $scope.badResult = 'There was a problem activating the software';
    }
  });

  $scope.putKey = function() {
    SettingService.putKey($scope.etag,$scope.data.friendlyName, $scope.data.key).then(function successCallback(response) {
      $rootScope.$broadcast('message-success', "Activation Processing");
      console.log($scope.etag);
      $rootScope.$broadcast('licencechangeFetch');
      $('.btn-activate').val('Please Wait...');
      $scope.showKey = false;
      $scope.showResult = true;
      $scope.intervalFunction();
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem getting the licence details " + response.data.message);
    });
  };

  $scope.activateTrial = function() {
    $scope.resetView();
    $scope.showResult = true;
    $rootScope.$broadcast('message-success', "Activation Processing");
    $rootScope.$broadcast('licencechangeFetch');
    $('.btn-activate').val('Please Wait...');
    SettingService.getCodeTrial().success(function(data) {
      $scope.trialCode = data.code;
      if ($scope.trialCode) {
        SettingService.getLMSlicence($scope.data.email, $scope.data.password, $scope.trialCode).success(function(lmsdata) { //FIXME Sort LMS errors
          SettingService.postCode(lmsdata.Code).success(function(serverresponse) {
          });
        });
      }
      $scope.intervalFunction();
    });
  }
}]);
app.controller('settings.general',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {


  $scope.submitForm = function() {
    $scope.data.hostnames = $scope.data.dns.split(",");
    delete $scope.data.dns;
    SettingService.putSettings($scope.etag,$scope.data)
     .then(function successCallback(response) {
      console.log($scope.data);
      $rootScope.$broadcast('message-success', "Settings Changed");
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', response.data.message);
    });
    $scope.loadsettings();
  };

  $scope.loadsettings = function() {
    SettingService.settingsList().then(function successCallback(response) {
      $scope.etag = response.headers('ETag');
      $scope.data = response.data;
      $scope.data.dns = $scope.data.hostnames.join();
      console.log($scope.data.hostnames);
      console.log($scope.data.dns);
    }, function errorCallback(response) {
       $rootScope.$broadcast('message-error', response.data);
    });
  };

  $scope.loadsettings();
}]);
app.controller('settings.signing.create',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {
  $scope.rule = {};
  $scope.submitForm = function() {
    SettingService.postSigningRule($scope.rule).then(function successCallback(response) {
        if (response.data.errors) {
        } else {
          $location.path('/settings/signing/list');
          $rootScope.$broadcast('message-success', "Signing Rule Created: " + $scope.rule.name);
        }
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "There was a problem creating the Signing Rule. " + response.data.message);
      });
  };
  SettingService.settingsList().then(function successCallback(response) {
    $scope.rule.certificateLifespan = response.data.certificateLifespan;
  }, function errorCallback(response) {
    $rootScope.$broadcast('message-error', "There was a problem retrieving a defaults. " + response.data.message);
  });
}]);
app.controller('settings.signing.edit',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {
  SettingService.getSigningRule($stateParams.id).then(function successCallback(response) {
    $scope.etag = response.headers('ETag');
    $scope.rule = response.data;

  }, function errorCallback(response) {
    $rootScope.$broadcast('message-error', "There was a problem getting the Signing Rule. " + response.data.message);
  });
  $scope.submitForm = function() {
    SettingService.putSigningRule($scope.etag,$scope.rule).then(function successCallback(response) {
        if (response.data.errors) {
        } else {
          $location.path('/settings/signing/list');
          $rootScope.$broadcast('message-success', "Signing Rule Edited: " + $scope.rule.name);
        }
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "There was a problem Editing the Signing Rule. " + response.data.message);
      });
  };

}]);
app.controller('settings.signing',['rootURL','$scope','$rootScope', '$http', 'SettingService', '$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {
  $scope.rules = []; 
  $scope.ruleList = function() {
    SettingService.signingList().then(function successCallback(response) {
      angular.forEach(response.data.list, function(c) {
        SettingService.getSigningRule(c).then(function successCallback(response) {
          SettingService.getSigningRuleInfo(c).then(function successCallback(inforesponse) {
            var data = response.data;
            data.info = inforesponse.data;
            data.etag = response.headers('ETag');
            $scope.rules.push(data);
          }, function errorCallback(inforesponse) {
            $rootScope.$broadcast('message-error', "There was a problem retrieving a rules info. " + inforesponse.data.message);
          });
        }, function errorCallback(response) {
          $rootScope.$broadcast('message-error', "There was a problem retrieving a rule. " + response.data.message);
        });
      });
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem retrieving the rule list list. " + response.data.message);
    });
  };
  $scope.deleteRule = function(rule, idx) {
    SettingService.deleteSigningRule(rule).then(function successCallback(data) {
      $scope.refresh();
      $rootScope.$broadcast('message-success', "Deleted Rule");
    }, function errorCallback(response) {
      $scope.refresh();
      $rootScope.$broadcast('message-error', "There was a problem deleting the rule: "+ response.data.message);
    });
  }

  $scope.refresh = function() {
    $scope.rules = [];
    $scope.ruleList();
  }

  $scope.rules = [];
  $scope.ruleList();
  
}]);
app.controller('settings.sync.create',['rootURL','$scope','$rootScope', '$http', 'SettingService', 'UserService', '$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, UserService, $stateParams, $location) {
  $scope.roles = [];
  $scope.loadSystemRoles = function() {
    UserService.getSystemRolesList()
      .then(function successCallback(response) {
        angular.forEach(response.data.list, function(c) {
           UserService.getRole(c)
             .then(function sucessClassback(roleresponse) {
               var role = {
                 name: roleresponse.data.name,
                 description: roleresponse.data.description,
                 id: c,
               };
               $scope.roles.push(role);
             }, function errorCallback(roleresponse) { 
               $rootScope.$broadcast('message-error', 'There was a problem finding available roles');
               $location.path('/settings/sync/list');
             });
        });
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', response.data);
      });
  };


  $scope.loadSystemRoles();

  $scope.submitForm = function() {
    if ($scope.sync.update == "true") {
      $scope.sync.update = true;
    } else {
      $scope.sync.update = false;
    }

    SettingService.postSync($scope.sync).then(function successCallback(response) {
        if (response.data.errors) {
        } else {
          $location.path('/settings/sync/list');
          $rootScope.$broadcast('message-success', "Sync Created: " + $scope.sync.name);
        }
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "There was a problem creating the sync job. " + response.data.message);
      });
  };
}]);
app.controller('settings.sync.edit',['rootURL','$scope','$rootScope', '$http', 'SettingService', 'UserService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, UserService, $stateParams, $location) {
  $scope.roles = [];
  $scope.loadSystemRoles = function() {
    UserService.getSystemRolesList()
      .then(function successCallback(response) {
        angular.forEach(response.data.list, function(c) {
           UserService.getRole(c)
             .then(function sucessClassback(roleresponse) {
               var role = {
                 name: roleresponse.data.name,
                 description: roleresponse.data.description,
                 id: c,
               };
               $scope.roles.push(role);
             }, function errorCallback(roleresponse) {
               $rootScope.$broadcast('message-error', 'There was a problem finding available roles');
               $location.path('/settings/sync/list');
             });
        });
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', response.data);
      });
  };


  $scope.loadSystemRoles();

  SettingService.getSync($stateParams.id).then(function successCallback(response) {
    console.log('fof');
    $scope.etag = response.headers('ETag');
    $scope.sync = response.data;
    

    $scope.submitForm = function() {
      SettingService.putSync($scope.etag,$stateParams.id,$scope.sync.name,$scope.sync.distinguishedName,$scope.sync.frequency,$scope.sync.roles).then(function successCallback(response) {
        if (response.data.errors) {
        } else {
          $location.path('/settings/sync/list');
          $rootScope.$broadcast('message-success', "Sync Edited: " + $scope.sync.name);
        }
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "There was a problem editing the sync job. " + response.data.message);
      });
    };
  });
}]);
app.controller('settings.sync',['rootURL','$scope','$rootScope', '$http', 'SettingService', '$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {
  $scope.syncs = []; 
  $scope.syncList = function() {
    SettingService.syncList().then(function successCallback(response) {
      angular.forEach(response.data.list, function(c) {
        SettingService.getSync(c).then(function successCallback(response) {
          $scope.syncs.push(response.data);
        }, function errorCallback(response) {
          $rootScope.$broadcast('message-error', "There was a problem retrieving a sync job. " + response.data.message);
        });
      });
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem retrieving the sync job list. " + response.data.message);
    });
  };

  $scope.refresh = function() {
    $scope.syncs = [];
    $scope.syncList();
  }

  $scope.syncs = [];
  $scope.syncList();

}]);
app.controller('user.create',['rootURL','$scope', '$rootScope', '$http', 'UserService','$location', function(rootURL, $scope, $rootScope, $http, UserService, $location) {

  $scope.show = {};
  $scope.next = function(stage) {
    $scope.show.details = false;
    $scope.show.roles = false;

    $scope.show[stage] = true;
//    console.log(stage);
//    console.log('login:'+$scope.show.login);
//    console.log('details:'+$scope.show.details);
//    console.log('options:'+$scope.show.options);
//    console.log('roles:'+$scope.show.roles);

    
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
      console.log($scope.createduser);
      $rootScope.$broadcast('message-success', "User Created: " + $scope.user.username);

    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem creating the user "+ response.data.message); 
    });
  };
         
  $scope.submitRoleForm = function() {
    $scope.userroles = $scope.user.roles;
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
  
  $scope.noRoles = function() {
    $location.path('/users/list');
  };

  $scope.loadSystemRoles = function() {
    UserService.getSystemRolesList()
      .then(function successCallback(response) {
        angular.forEach(response.data.list, function(c) {
           UserService.getRole(c)
             .then(function sucessClassback(roleresponse) {
               if (roleresponse.data.name != 'Client User') {

                 var role = {
                   name: roleresponse.data.name,
                   description: roleresponse.data.description,
                   id: c
                 };
                 $scope.roles.push(role);
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

  $scope.loadSystemRoles();

}]);
app.controller('user.edit',['rootURL','$scope','$rootScope', '$http', 'UserService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, UserService, $stateParams, $location) {

  $scope.roles = [];
  UserService.getUser($stateParams.id)
    .then(function successCallback(response) {
      $scope.uetag = response.headers('ETag');
      $scope.user = response.data;
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', response.data.message); 
    });



  $scope.submitForm = function() {
    var prepared = {
     firstname: $scope.user.firstname,
     lastname: $scope.user.lastname,
     username: $scope.user.username,
     disabled: $scope.user.disabled,
     externalAuth: $scope.user.externalAuth
    };
    if ($scope.user.password) {
     prepared.password = $scope.user.password;
    }
    UserService.putUser($stateParams.id, prepared, $scope.uetag).then(function successCallback(response) {
      UserService.putRoles($stateParams.id,$scope.user.roles,$scope.retag).then(function successCallback(role) {
        $rootScope.$broadcast('message-success', "User Edited: " + $scope.user.username);
      }, function errorCallback(role) {
        $rootScope.$broadcast('message-error', "There was a problem updating the users roles. " + role.data.message); 
      });
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem updating the user. " + response.data.message); 
    });
  };

  $scope.loadSystemRoles = function() {
    UserService.getSystemRolesList()
      .then(function successCallback(response) {
        angular.forEach(response.data.list, function(c) {
           UserService.getRole(c)
             .then(function sucessClassback(roleresponse) {
               var role = {
                 name: roleresponse.data.name,
                 description: roleresponse.data.description,
                 id: c,
               };
               $scope.roles.push(role);
             }, function errorCallback(roleresponse) { 
               $rootScope.$broadcast('message-error', 'There was a problem finding available roles');
               $location.path('/users/list');
             });
        });
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', response.data);
      });
  };


  $scope.loadSystemRoles();

  UserService.getUserRoles($stateParams.id)
    .then(function successClassback(response) {
      $scope.retag = response.headers('ETag');
      $scope.user.roles = response.data.list;
      
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', error.error); 
    });
}]);
app.controller('user.list',['rootURL','$scope', '$http', 'UserService', '$rootScope', function(rootURL, $scope, $http, UserService,$rootScope) {

  $scope.loadUserList = function() {
    UserService.userList().then(function successCallback(users) {
      angular.forEach(users.data.list, function(c) {
        UserService.getUser(c).then(function successCallback(user) {
          user.data.etag = user.headers('ETag');
          $scope.users.push(user.data);
        }, function errorCallback(userresponse) {
          $rootScope.$broadcast('message-error', "There was a problem getting the user info "+ userresponse.data.message);
        });
      });
    }, function errorCallback(usersresponse) {
      $rootScope.$broadcast('message-error', "There was a problem getting the users list "+ usersresponse.data.message);
    });
  };

  $scope.deleteUser = function(user, idx) {
    UserService.deleteUser(user).then(function successCallback(data) {
      $scope.refresh();
      $rootScope.$broadcast('message-success', "Deleted User");
    }, function errorCallback(response) {
      $scope.refresh();
      $rootScope.$broadcast('message-error', "There was a problem deleting the user: "+ response.data.message);
    });
  }


  $scope.refresh = function() {
    $scope.users = [];
    $scope.loadUserList();
  }

  $scope.users = [];
  $scope.loadUserList();
}]);
