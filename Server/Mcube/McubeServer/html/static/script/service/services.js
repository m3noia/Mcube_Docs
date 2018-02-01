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

app.service('DebugService', function($http, rootURL) {
  this.getEndpoint = function(endpoint) {
    return $http.get(rootURL + endpoint);
  };
  this.putEndpoint = function(ETag, endpoint, json) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL + endpoint, json, config);
  };

});

app.service('DeviceService', function($http, rootURL) {
  this.deviceList = function() {
    return $http.get(rootURL + '/devices/valid');
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

  this.unrejectCertificateRequest = function(uuid, ETag) {
    var data = { };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.post(rootURL + "/certificates/requests/" + uuid + "/unreject", data, config);
  };

  // Certificates

  this.getCertificate = function(uuid) {
    return $http.get(rootURL + "/certificates/" + uuid, {withCredentials : true});
  };

  // CRL
  
  this.deviceCRLList = function() {
    return $http.get(rootURL + '/devices/revoked/', {withCredentials : true});
  };

});

app.service('SessionService', function($http, rootURL) {
  this.sessionList = function() {
    return $http.get(rootURL + '/sessions/');
  };
  this.getSession = function(uuid) {
    return $http.get(rootURL +"/sessions/" + uuid);
  };
});

app.service('SettingService', function($http, rootURL, lmsURL) {
  this.settingsList = function() {
    return $http({
      method: 'GET',
      url: rootURL + '/server/settings',
    });
  };
  this.putSettings = function(ETag, settings) {
    var data = settings;
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/server/settings", data, config);
  };

  this.getLMSAccounts = function(User, Pass) {
    var data = { 'ProductCode': 'CS09','User': User, 'Pass': Pass };
    var config = { withCredentials: false, headers : { 'Content-Type': 'application/json'}};
    return $http.post(lmsURL+'/oapi/accounts', data, config);
  };

  this.getLMSlicence = function(User, Pass, Code) {
    var data = { 'User': User, 'Pass': Pass, 'Code': Code };
    var config = { withCredentials: false, headers : { 'Content-Type': 'application/json'}};
    return $http.post(lmsURL+'/oapi/validate', data, config);
  };
  this.postCode = function(Code) {
    var data = {'code': Code };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json'}};
    return $http.post('/server/licence/codes', data, config);
  };
  this.putKey = function(ETag, friendlyname, key) {
    var data = { 'friendlyName':friendlyname, 'licenceKey': key,};
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag}};
    return $http.put(rootURL +"/server/settings/licence", data, config);
  };
  this.putProxy = function(ETag, data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag}};
    return $http.put(rootURL +"/server/settings/proxy", data, config);
  };
  this.getLicence = function() {
    return $http.get(rootURL + '/server/settings/licence');
  };
  
  this.getCodeNormal = function() {
    return $http.get(rootURL + '/server/licence/codes/normal');
  };
  this.getCodeTrial = function() {
    return $http.get(rootURL + '/server/licence/codes/trial');
  };
  this.getLicenceInfo = function() {
    return $http.get(rootURL + '/server/licence/info');
  };

  this.syncList = function() {
    return $http.get(rootURL + '/server/sync');
  };

  this.getSync = function(uuid) {
    return $http.get(rootURL +"/server/sync/" + uuid);
  };
  this.postSync = function(data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json'}};
    return $http.post(rootURL +"/server/sync", data, config);
  };
  this.putSync = function(ETag, uuid, name, distinguishedname, frequency, roles) {
    var data = { 'name': name, 'distinguishedName': distinguishedname, 'frequency': frequency, 'roles': roles };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/server/sync/"+ uuid, data, config);
  };
  this.getEmail = function() {
    return $http.get(rootURL +"/server/settings/email/");
  };
  this.putEmail = function(ETag, data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/server/settings/email/",data, config);
  };
  this.getServerInfo = function() {
    return $http.get(rootURL +"/server/info");
  };
  this.signingList = function() {
    return $http.get(rootURL +"/certificates/signingprocedures");
  };
  this.getSigningRule = function(uuid) {
    return $http.get(rootURL +"/certificates/signingprocedures/" + uuid);
  };
  this.getSigningRuleInfo = function(uuid) {
    return $http.get(rootURL +"/certificates/signingprocedures/" + uuid + "/info");
  };
  this.postSigningRule = function(rule) {
    var data = rule;
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json'}};
    return $http.post(rootURL +"/certificates/signingprocedures", data, config);
  };
  this.putSigningRule = function(ETag, data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/certificates/signingprocedures/"+ data.id, data, config);
  };
  this.deleteSigningRule = function(data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': data.etag }};
    return $http.delete(rootURL +"/certificates/signingprocedures/"+ data.id, config);
  };
  
});

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
  this.putUser = function(uuid,data, ETag) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/users/"+ uuid, data, config);
  };
  this.putRoles = function(uuid, roles, ETag) {
    var data = { 'list': roles };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/users/" + uuid + "/roles", data, config);
  };
});

