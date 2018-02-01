app.service('CertificateService', function($http, rootURL) {
  this.certificateList = function() {
    return $http.get(rootURL + '/certificates/', {withCredentials : true});
  };
  this.getCertificateRequest = function(uuid) {
    return $http.get(rootURL + "/certificates/requests/" + uuid, {withCredentials : true});
  };
  this.getCertificate = function(uuid) {
    return $http.get(rootURL + "/certificates/" + uuid, {withCredentials : true});
  };

  this.revokeCertificate = function(uuid, ETag) {
    var data = { uuid: uuid, reason: 'Revoked by Admin' };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.post(rootURL + "/certificates/crl/", data, config);
  };

  // Requests 

  this.certificateRequestList = function(state) {
    return $http.get(rootURL + '/certificates/requests/' + state, {withCredentials : true});
  };

  this.signCertificateRequest = function(uuid, ETag) {
    var data = { lifespan: 365 };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.post(rootURL + "/certificates/requests/" + uuid + "/approve", data, config);
  };

  this.rejectCertificateRequest = function(uuid, ETag) {
    var data = { reason: 'Rejected by Admin' };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.post(rootURL + "/certificates/requests/" + uuid + "/reject", data, config);
  };


  // CRL
  
  this.certificateCRLList = function() {
    return $http.get(rootURL + '/certificates/crl/', {withCredentials : true});
  };

  this.getCRLCertificate = function(uuid) {
    return $http.get(rootURL + "/certificates/crl/" + uuid, {withCredentials : true});
  };

  
});

