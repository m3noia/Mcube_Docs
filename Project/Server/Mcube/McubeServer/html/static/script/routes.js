app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
   
  $urlRouterProvider.otherwise('/dash');
    
  $stateProvider
        
  // HOME STATES AND NESTED VIEWS ========================================
  .state('dash', {
     url: '/dash',
     templateUrl: 'home.html',
     controller: 'dash',
     ncyBreadcrumb: {
      label: 'Dashboard',
     }
  })
  .state('users', {
     url: '/users',
     templateUrl: 'users/users.html',
     redirectTo: 'users.list',
     ncyBreadcrumb: {
      label: 'Users',
     }
  })
  .state('users.list', {
     url: '/list',
     templateUrl: 'users/list.html',
     controller: 'user.list',
     ncyBreadcrumb: {
      label: 'List',
     }
  })
  .state('users.edit', {
     url: '/:id/edit',
     templateUrl: 'users/edit.html',
     controller: 'user.edit',
     ncyBreadcrumb: {
      label: 'Edit',
     }
  })
  .state('users.create', {
     url: '/create',
     templateUrl: 'users/create.html',
     controller: 'user.create',
     ncyBreadcrumb: {
      label: 'Create',
     }
  })
  .state('device', {
     url: '/devices',
     templateUrl: 'devices/devices.html',
     redirectTo: 'device.requests',
     ncyBreadcrumb: {
      label: 'Devices',
     }
  })
  .state('device.requests', {
     url: '/requests',
     templateUrl: 'devices/requests.html',
     controller: 'device.requests',
     ncyBreadcrumb: {
      label: 'Requests',
     }
  })
  .state('device.rejected', {
     url: '/rejected',
     templateUrl: 'devices/rejected.html',
     controller: 'device.rejected',
     ncyBreadcrumb: {
      label: 'Rejected',
     }
  })
  .state('device.authenticated', {
     url: '/authenticated',
     templateUrl: 'devices/authenticated.html',
     controller: 'device.authenticated',
     ncyBreadcrumb: {
      label: 'Authenticated',
     }
  })
  .state('device.revoked', {
     url: '/revoked',
     templateUrl: 'devices/revoked.html',
     controller: 'device.revoked',
     ncyBreadcrumb: {
      label: 'Revoked',
     }
  })
 
  .state('settings', {
     url: '/settings',
     templateUrl: 'settings/settings.html',
     redirectTo: 'settings.email',
     ncyBreadcrumb: {
      label: 'Server Settings',
     }
  })
 .state('settings.advanced', {
     url: '/advanced',
     templateUrl: 'settings/advanced.html',
     controller: 'settings.advanced',
     ncyBreadcrumb: {
      label: 'Advanced',
     }
  })
 .state('settings.licence', {
     url: '/licence',
     templateUrl: 'settings/licence.html',
     controller: 'settings.licence',
     ncyBreadcrumb: {
      label: 'Licence Settings',
     }
  })
 .state('settings.email', {
     url: '/email',
     templateUrl: 'settings/email.html',
     controller: 'settings.email',
     ncyBreadcrumb: {
      label: 'Email Notifications',
     }
  })
  .state('settings.sync', {
     url: '/sync',
     templateUrl: 'settings/sync/sync.html',
     redirectTo: 'settings.sync.list',
     ncyBreadcrumb: {
      label: 'Active Directory Sync',
     },
  })
  .state('settings.sync.list', {
     url: '/list',
     templateUrl: 'settings/sync/list.html',
     controller: 'settings.sync',
     ncyBreadcrumb: {
      label: 'Sync Jobs',
     },
  })
  .state('settings.sync.edit', {
     url: '/:id/edit',
     templateUrl: 'settings/sync/edit.html',
     controller: 'settings.sync.edit',
     ncyBreadcrumb: {
      label: 'Edit',
     }
  })
 .state('settings.sync.create', {
     url: '/create',
     templateUrl: 'settings/sync/create.html',
     controller: 'settings.sync.create',
     ncyBreadcrumb: {
      label: 'Create',
     }
  })
  .state('settings.signing', {
     url: '/signing',
     templateUrl: 'settings/signing/signing.html',
     redirectTo: 'settings.signing.list',
     ncyBreadcrumb: {
      label: 'Certificate Signing',
     },
  })
  .state('settings.signing.list', {
     url: '/list',
     templateUrl: 'settings/signing/list.html',
     controller: 'settings.signing',
     ncyBreadcrumb: {
      label: 'Rules',
     },
  })
  .state('settings.signing.create', {
     url: '/create',
     templateUrl: 'settings/signing/create.html',
     controller: 'settings.signing.create',
     ncyBreadcrumb: {
      label: 'Create Rule',
     },
  })
  .state('settings.signing.edit', {
     url: '/:id/edit',
     templateUrl: 'settings/signing/edit.html',
     controller: 'settings.signing.edit',
     ncyBreadcrumb: {
      label: 'Edit Rule',
     },
  })
  .state('settings.backup', {
     url: '/backup',
     templateUrl: 'settings/backup.html',
     controller: 'settings.backup',
     ncyBreadcrumb: {
      label: 'Backup/Restore',
     },
  })
  .state('settings.proxy', {
     url: '/proxy',
     templateUrl: 'settings/proxy.html',
     controller: 'settings.proxy',
     ncyBreadcrumb: {
      label: 'Server Web Proxy',
     },
  })
  .state('devicesettings', {
     url: '/devicesettings',
     templateUrl: 'devicesettings/settings.html',
     redirectTo: 'devicesettings.systemmessages',
     ncyBreadcrumb: {
      label: 'Device Settings',
     }
  })
  .state('devicesettings.systemmessages', {
     url: '/systemmessages',
     templateUrl: 'devicesettings/systemmessages.html',
     controller: 'devicesettings.systemmessages',
     ncyBreadcrumb: {
      label: 'System Messages',
     },
  })
  .state('devicesettings.proxy', {
     url: '/proxy',
     templateUrl: 'devicesettings/proxy.html',
     controller: 'devicesettings.proxy',
     ncyBreadcrumb: {
      label: 'Device Proxy',
     },
  })
  .state('devicesettings.security', {
     url: '/security',
     templateUrl: 'devicesettings/security.html',
     controller: 'devicesettings.security',
     ncyBreadcrumb: {
      label: 'Device Security',
     },
  })
  .state('debug', {
     url: '/debug',
     templateUrl: 'debug/debug.html',
     controller: 'debug',
     ncyBreadcrumb: {
      label: 'Debug',
     }
  })
  .state('stats', {
     url: '/stats',
     templateUrl: 'stats.html',
     controller: 'stats',
     ncyBreadcrumb: {
      label: 'Stats',
     }
  })

  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.headers.common['X-AB-Protocol'] = '1';
//  $locationProvider.html5Mode(true);
});
app.config(function($breadcrumbProvider) {
  $breadcrumbProvider.setOptions({
    templateUrl: 'breadcrumb.html'
  });
});1
