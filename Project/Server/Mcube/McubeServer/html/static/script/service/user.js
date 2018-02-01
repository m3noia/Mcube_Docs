app.service('UserService', function($http, rootURL) {
  this.userList = function() {
    return $http.get(rootURL + '/users/');
  };
  this.getUser = function(uuid) {
    return $http.get(rootURL +"/users/" + uuid);
  };
  this.getSelf = function() {
    return $http.get(rootURL +"/users/self");
  };
  this.getUserRoles = function(uuid) {
    return $http({
      method: 'GET',
      url: rootURL +"/users/" + uuid +"/roles",
    });
  };
  this.getSystemRolesList = function() {
    return $http({
      method: 'GET',
      url: rootURL + '/roles/system',
    });
  };
  this.getRole = function(uuid) {
    return $http({
      method: 'GET',
      url: rootURL + '/roles/'+uuid,
    });
  };
  this.postUser = function(data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json'}};
    return $http.post(rootURL +"/users/", data, config);
  };
  this.deleteUser = function(data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json' , 'If-None-Match': data.etag }};
    return $http.delete(rootURL +"/users/" + data.id, config);
  };
  this.putUser = function(uuid, user, ETag) {
    delete user.id;
    var data = user;
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/users/"+ uuid, data, config);
  };
  this.putRoles = function(uuid, roles, ETag) {
    var data = { 'list': roles };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/users/" + uuid + "/roles", data, config);
  };
});

