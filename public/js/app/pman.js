var PMan = angular.module('PurchaseManager', ['services', 'ui.bootstrap', 'ngUpload', 'ui.utils', 'ui.select2']);
var service = angular.module('services', ['ngResource']);

PMan.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.when('/overview', {templateUrl: 'partials/overview.html'})
        .when('/overview/:status', {templateUrl: 'partials/overview.html'})
        .when('/purchase-orders/:id', {templateUrl: 'partials/purchase-order.html'})
        .when('/purchase-order/:id', {templateUrl: 'partials/purchase-order-new.html'})
        .when('/quickrfx', {templateUrl: 'partials/quickrfx-new.html'})
        .when('/quickrfx/:quotationRequestId', {templateUrl: 'partials/quickrfx-new.html'})
        .when('/quickquote/:quotationId', {templateUrl: 'partials/quickquote.html', requireLogin : false })
        .when('/purchase-request/:id', {templateUrl: 'partials/purchase-request.html'})
        .when('/purchase-goods/:id', {templateUrl: 'partials/goods-receipt.html'})
        .when('/purchase-request-item/:id', {templateUrl: 'partials/purchase-request-item.html'})
        .when('/purchase-request-template', {templateUrl: 'partials/purchase-request-template.html'})
        .when('/profile', {templateUrl: 'partials/profile.html'})
        .when('/settings', {templateUrl: 'partials/settings.html'})
        .when('/company-settings', {templateUrl: 'partials/company-settings.html'})
        .when('/suppliers', {templateUrl: 'partials/suppliers.html'})
        .when('/content-manager', {templateUrl: 'partials/content-overview.html'})
        .when('/search-results/:keyword', {templateUrl: 'partials/searchResults.html'})
        .when('/details/:id', {templateUrl: 'partials/details.html'})
        .when('/user-management', {templateUrl: 'partials/user-management.html'})
        .when('/reports', {templateUrl: 'partials/reports.html'})
        .when('/404', { templateUrl: '/partials/404'})
        .when('/organization', {templateUrl: 'partials/org-management.html'})
        .when('/address-management', {templateUrl: 'partials/address-management.html'})
        .when('/accounting', {templateUrl: 'partials/accounting.html'})
        .when('/master-data', {templateUrl: 'partials/master-data.html'})
        .when('/logo-click/:parentStatus', {templateUrl: 'partials/overview.html'})

        .otherwise({redirectTo: '/overview'});

    // $locationProvider.html5Mode(true);

    var interceptor = ['$location', '$q', function ($location, $q) {
        function success(response) {
            return response;
        }

        function error(response) {
            if (response.status === 401) {
                window.location.href = response.data.split('=').slice(1,2).join();
                return $q.reject(response);
            }
            else {
                return $q.reject(response);
            }
        }

        return function (promise) {
            return promise.then(success, error);
        }
    }];

    $httpProvider.responseInterceptors.push(interceptor);
}]);

PMan.filter('timestampToDate', function() {
   return function(input) {
    if (angular.isDefined(input)) {
        var date = new Date(input);
        
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        
        var str = month + '/' + day + '/' + year;
        return str;
    }
    return '';
   }
});


PMan.run(function ($rootScope, $location) {
    $rootScope.currentRequest = undefined;

//    $rootScope.clientSideVSD = $cookieStore.get('clientSideVSD') || { username: '', roles: routingConfig.userRoles.public };
//    $cookieStore.remove('clientSideVSD');

//    $rootScope.$on("$routeChangeStart", function (event, next, current) {
//        $rootScope.error = null;
//        $location.path('/login');
//        if (!(next.access & $rootScope.clientSideVSD.roles)) {
//            if($rootScope.clientSideVSD&&$rootScope.clientSideVSD.roles){
//                rootScope.clientSideVSD.roles.forEach(function (role){
//                    if(routingConfig.userRoles.roles[role]!=-1){
//                        //$location.path('/');
//                    }
//                });
//            }
//        }
//    });
});