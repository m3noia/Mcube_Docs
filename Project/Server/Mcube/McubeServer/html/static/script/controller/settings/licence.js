app.controller('settings.licence',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location','$timeout', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location,$timeout) {
  $scope.disable = {};

  $scope.checkConnectivity = function() {
    console.log();
    SettingService.getLMSCheck().then(function successCallback(response) {
      if (response.data.status == 'OK') {
        $scope.isOnline = true;
        $scope.validationType();
      }
    }, function errorCallback(response) {
      $scope.isOnline = false;
      $scope.validationType();

    });

  };


  $scope.getAccounts = function() {
    $scope.lmserror = undefined;
    $scope.multipleAccounts = false;
    $rootScope.$broadcast('server-loading');
    SettingService.getLMSAccounts($scope.data.email, $scope.data.password).then(function successCallback(response) {
      if (response.data.status == 23) {
        $rootScope.$broadcast('message-error', "Your abtutor.com username and password were not recognised");
        $rootScope.$broadcast('server-loaded');
        return;
      }
      switch(response.data.status) {
        case 3:
          $scope.lmserror = response.data.Error;
          break;
        case 22:
          $scope.lmserror = undefined;
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
      $rootScope.$broadcast('server-loaded');
    }, function errorCallback(response) {
      $rootScope.$broadcast('server-loaded');
      $rootScope.$broadcast('message-error', "There was a problem communicating with the AB Tutor website " + response.data.message);
    });
  };

  $scope.resetView = function() {
    $scope.showvalidationType = false;
    $scope.showTrial = false;
    $scope.showPickMethod = false;
    $scope.showKey = false;
    $scope.showLogin = false;
    $scope.showWaiting = false;
    $scope.showUnlock = false;
    $scope.showContactSupport = false;
    $scope.showResult = false;
  };

  SettingService.getLicenceInfo().then(function successCallback(response) {
    $scope.etag = response.headers('ETag');
    $scope.data = {};
    $scope.data.friendlyName = response.data.friendlyName;
  }, function errorCallback(response) {
    $rootScope.$broadcast('message-error', "There was a problem getting the licence details " + response.data.message);
  });
  $scope.waiting = function() {
    $scope.resetView();
    $scope.showWaiting = true;
    $scope.checkConnectivity();
  };
  $scope.waiting(); //Fire the first page

  $scope.validationType = function() {
    $scope.resetView();
    $scope.showvalidationType = true;
  }; 
  $scope.useTrial = function() {
    $scope.resetView();
    $scope.showTrial = true;
  }

  $scope.useUnlock = function(type) {
    $scope.resetView();
    $scope.showUnlock = true;
    if (type == 'Trial') {
      $scope.isTrial = true;
      SettingService.getCodeTrial().then(function successCallback(response) {
        $scope.unlockCode = response.data.code;
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "The server had a problem generating a trial code. " + response.data.message);
      });
      $scope.showUnlock = true;
    } else {
      SettingService.getCodeNormal($scope.data.friendlyName, $scope.data.key).then(function successCallback(response) {
        $scope.unlockCode = response.data.code;
      }, function errorCallback(response) {
        $rootScope.$broadcast('message-error', "The server had a problem generating a code. " + response.data.message);
      });
      $scope.showUnlock = true;
    }
  }; 

  $scope.setPickMethod = function() {
    $scope.resetView();
    $scope.showPickMethod = true;
  }; 
  $scope.setNoConnection = function() {
    $scope.resetView();
    $scope.showContactSupport = true;

  };

  $scope.useKey = function(key,owner) {
    $scope.resetView();
    SettingService.getLicence().then(function successCallback(response) {
      $scope.data.friendlyName = response.data.friendlyName;
    });
    $scope.showKey = true;
    $scope.data.owner = owner;
    if (key != undefined) {
      $scope.data.key = key;
    }
  };

  $scope.useLogin = function() {
    $scope.resetView();
    $scope.showLogin = true;
    $scope.accountLookup = true;
  };
  
  $scope.validTicket = function(ticket) {
    return false;
  

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
    SettingService.postKey($scope.etag,$scope.data.friendlyName, $scope.data.key).then(function successCallback(response) {
      $rootScope.$broadcast('message-success', "Activation Processing");
      $rootScope.$broadcast('licencechangeFetch');
      $('.btn-activate').val('Please Wait...');
      $scope.showKey = false;
      $scope.showResult = true;
      $scope.intervalFunction();
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', "There was a problem getting the licence details " + response.data.message);
    });
  };

  $scope.activateUnlock = function() {
    if ($scope.data.unlockCode === undefined) {
      $rootScope.$broadcast('message-error', "Please enter an activation code in the bottom box");
      return;
    }

    SettingService.postCode($scope.data.unlockCode).then(function successCallback(response) {
      $scope.resetView();
      $scope.showResult = true;
      $rootScope.$broadcast('message-success', "Activation Processing");
      $rootScope.$broadcast('licencechangeFetch');
    }, function errorCallback(response) {

      $rootScope.$broadcast('message-error', "There was a problem sending the code to the server. " + response.data.message);
    });
    $scope.intervalFunction();
  }

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
          console.log(lmsdata.Code);
          SettingService.postCode(lmsdata.Code).success(function(serverresponse) {
            $scope.intervalFunction();
          });
        });
      }
    });
  }
}]);
