app.controller('settings.backup',['rootURL','$scope','$rootScope', '$http', 'SettingService','$stateParams','$location', function(rootURL, $scope,$rootScope, $http, SettingService, $stateParams, $location) {

  $scope.submitRestore = function(files) {
    var fd = new FormData();
    fd.append("file", files[0])
    SettingService.postBackup(fd)
     .then(function successCallback(response) {
      $rootScope.$broadcast('message-success', "File Uploaded, please restart the server service for the restore to take effect.");
      $scope.uploadSuccess = 'File uploaded!';      
      $('#file').closest('form').get(0).reset();
    }, function errorCallback(response) {
      $rootScope.$broadcast('message-error', response.data.message);
      $('#file').closest('form').get(0).reset();
    });
  };

}]);
