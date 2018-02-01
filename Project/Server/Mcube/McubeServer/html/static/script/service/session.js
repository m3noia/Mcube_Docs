app.service('SessionService', function($http, rootURL) {
  this.sessionList = function() {
    return $http.get(rootURL + '/sessions/');
  };
  this.getSession = function(uuid) {
    return $http.get(rootURL +"/sessions/" + uuid);
  };
});

