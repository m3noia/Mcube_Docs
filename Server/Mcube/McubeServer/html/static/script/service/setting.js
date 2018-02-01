app.service('SettingService', function($http, rootURL, lmsURL, productCode) {
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

  this.getLMSCheck = function() {
    var config = { withCredentials: false,  headers : { 'Content-Type': 'application/json'}};
    return $http({ 
      method: 'GET', 
      url: lmsURL+'/oapi/check', 
      timeout: 30000,
      withCredentials: false,
      headers: { 'Content-Type': 'application/json'},
      ignoreAuthModule: true
      });
  };

  this.getLatestVersion = function() {
    var config = { withCredentials: false,  headers : { 'Content-Type': 'application/json'}};
    return $http({ 
      method: 'GET', 
      url: lmsURL+'/oapi/versioncheck', 
      timeout: 20000,
      withCredentials: false,
      headers: { 'Content-Type': 'application/json'},
      ignoreAuthModule: true,
      params: { productcode: productCode }
      });
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
  this.postKey = function(ETag, friendlyname, key) {
    var data = { 'friendlyName': friendlyname, 'licenceKey': key };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag}};
    return $http.post(rootURL +"/server/licence/online", data, config);
  };
  this.putProxy = function(ETag, data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag}};
    return $http.put(rootURL +"/server/settings/proxy", data, config);
  };
  this.getLicence = function() {
    return $http.get(rootURL + '/server/settings/licence');
  };
  
  this.getCodeNormal = function(friendlyName, key) {
    var data = { friendlyName: friendlyName, licenceKey: key };
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json' }};
    return $http.post(rootURL + '/server/licence/unlock', data, config);
  };
  this.getCodeTrial = function() {
    return $http.get(rootURL + '/server/licence/trial');
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

  this.putSync = function(ETag, uuid, data) {
    delete data.id;
    delete data.lastRan;
    delete data.path;
    delete data.success;
    delete data.type;
    console.log(data.roles);
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/server/sync/"+ uuid, data, config);
  };

  this.syncRun = function(uuid) {
    return $http.post(rootURL +"/server/sync/"+ uuid +"/run");
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json' }};
  };
  this.deleteSync = function(data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json' , 'If-None-Match': data.etag }};
    return $http.delete(rootURL +"/server/sync/" + data.id, config);
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
    var stuff = jQuery.extend({},data);
    delete stuff.id;
    return $http.put(rootURL +"/certificates/signingprocedures/"+ data.id, stuff, config);
  };
  this.deleteSigningRule = function(data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': data.etag }};
    return $http.delete(rootURL +"/certificates/signingprocedures/"+ data.id, config);
  };
  this.postBackup = function(fd) {
    var config = { withCredentials: true, headers : { 'Content-Type': undefined }, transformRequest: angular.identity };
    return $http.post(rootURL +"/server/settings/import", fd, config);
  };
  this.getProxy = function() {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json'}};
    return $http.get(rootURL +"/server/settings/proxy",config);
  };
  this.putProxy = function(ETag, data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/server/settings/proxy", data, config);
  };
  this.getDeviceGlobal = function() {
    return $http.get(rootURL +"/devices/settings/global");
  };
  this.putDeviceGlobal = function(ETag, data) {
    var config = { withCredentials: true, headers : { 'Content-Type': 'application/json', 'If-None-Match': ETag }};
    return $http.put(rootURL +"/devices/settings/global", data, config);
  };
  this.getDebug = function() {
    return $http.get(rootURL +"/server/settings/debug");
  };
});

