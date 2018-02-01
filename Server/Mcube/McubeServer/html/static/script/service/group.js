app.service('GroupService', function($http, rootURL) {
  this.groupList = function() {
    return $http.get(rootURL + '/groups/groups');
  };
  this.getGroup = function(uuid) {
    return $http.get(rootURL +"/groups/" + uuid);
  };
  this.getDefinition = function(uuid) {
    return $http.get(rootURL +"/directives/definitions/" + uuid);
  };
});

