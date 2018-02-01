app.service('DeviceService', function($http, rootURL) {
  this.deviceListCount = function() {
    return $http.get(rootURL + '/devices/valid');
  };
  this.deviceList = function(count, page) {
    var params = { count: count, page: page };
    return $http.get(rootURL + '/devices/valid', {withCredentials : true, params: params});
  };
  this.getDevice = function(uuid) {
    return $http.get(rootURL +"/devices/" + uuid);
  };

  this.certificateList = function() {
    return $http.get(rootURL + '/certificates/', {withCredentials : true});
  };
  this.revokeDevice = function(uuid, ETag) {
    var data = { reason: 'Revoked by Admin' };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.post(rootURL + "/devices/" + uuid + "/revoke", data, config);
  };

  this.unRevokeDevice = function(uuid, ETag) {
    var data = { };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.post(rootURL + "/devices/" + uuid + "/unrevoke", data, config);
  };

  // Requests 

  this.getCertificateRequest = function(uuid) {
    return $http.get(rootURL + "/certificates/requests/" + uuid, {withCredentials : true});
  };

  this.certificateRequestList = function(state,count,page) {
    var params = { count: count, page: page };
    return $http.get(rootURL + '/certificates/requests/' + state, {withCredentials : true, params: params});
  };

  this.certificateRequestListAll = function(state) {
    return $http.get(rootURL + '/certificates/requests/' + state, {withCredentials : true});
  };

  this.certificateRequestListCount = function(state) {
    var params = {};
    return $http.get(rootURL + '/certificates/requests/' + state, {withCredentials : true, params: params});
  };

  this.signCertificateRequest = function(uuid, ETag) {
    var data = { lifespan: 365 };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.post(rootURL + "/certificates/requests/" + uuid + "/approve", data, config);
  };

  this.signCertificateRequestTest = function(uuid, ETag) {
    var data = { lifespan: 365 };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.post(rootURL + "/certificates/requests/" + uuid + "/approve", data, config);
  };

  this.rejectCertificateRequest = function(uuid, ETag) {
    var data = { reason: 'Rejected by Admin' };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.post(rootURL + "/certificates/requests/" + uuid + "/reject", data, config);

  };

  this.unrejectCertificateRequest = function(uuid, ETag) {
    var data = {  };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.post(rootURL + "/certificates/requests/" + uuid + "/unreject", data, config);
  };

  // Certificates

  this.getCertificate = function(uuid) {
    return $http.get(rootURL + "/certificates/" + uuid, {withCredentials : true});
  };

  // CRL
  
  this.deviceCRLList = function(count,page) {
    var params = { count: count, page: page };
    return $http.get(rootURL + '/devices/revoked', {withCredentials : true, params: params});
  };

});

