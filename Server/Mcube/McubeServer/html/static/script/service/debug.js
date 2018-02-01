app.service('DebugService', function($http, rootURL) {
  this.getEndpoint = function(endpoint) {
    return $http.get(rootURL + endpoint);
  };
  this.putEndpoint = function(ETag, endpoint, json) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL + endpoint, json, config);
  };

  this.deleteEndpoint = function(ETag, endpoint) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.delete(rootURL + endpoint, config);
  };
});

