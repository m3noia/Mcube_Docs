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
