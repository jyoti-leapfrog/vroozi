'use strict';

service.factory('AclControls', function ($resource) {
    return $resource('api/acl-controls', {}, {
        query: {method: 'GET', params: {}, isArray: false}
    });
});
/* Services */
service.factory('MessageService', function ($rootScope) {
    var messagingService = {};

    messagingService.publish = function (topicName, msg) {
        $rootScope.$broadcast(topicName, msg);
    };

    return messagingService;
});
service.factory('CompanySettings', function ($resource) {
    return $resource('api/companysettings', {}, {
        query: {method: 'GET', params: {}, isArray: false},
        update: { method: 'PUT' }
    });
});

service.factory('SharedService', function($rootScope) {
    var sharedService = {};

    sharedService.message = '';

    sharedService.prepForBroadcast = function(msg) {
        this.message = msg;
        this.broadcastItem();
    };

    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('handleBroadcast');
    };

    return sharedService;
});

service.factory('SearchService', function($rootScope) {
    var searchService = {};

//    searchService.message = '';

    searchService.prepForBroadcast = function() {
//        this.message = msg;
        this.broadcastItem();
    };

    searchService.broadcastItem = function() {
        $rootScope.$broadcast('searchBroadcast');
    };

    return searchService;
});

service.factory('SearchServicePO', function($rootScope) {
    var searchServicePO = {};

//    searchService.message = '';

    searchServicePO.prepForBroadcast = function() {
//        this.message = msg;
        this.broadcastItem();
    };

    searchServicePO.broadcastItem = function() {
        $rootScope.$broadcast('searchBroadcastPO');
    };

    return searchServicePO;
});

service.factory('FilterSummary', function($rootScope) {
    var filterSummary = {};

    filterSummary.statusParam = '';

    filterSummary.prepForBroadcast = function(data) {
        this.statusParam = data;
        this.broadcastItem();
    };

    filterSummary.broadcastItem = function() {
        $rootScope.$broadcast('filterSummary');
    };

    return filterSummary;
});

service.factory('TabService', function($rootScope) {
    var tabService = {};

    tabService.tabParam = '';

    tabService.prepForBroadcast = function(data) {
        this.tabParam = data;
        this.broadcastItem();
    };

    tabService.broadcastItem = function() {
        $rootScope.$broadcast('tabBroadcast');
    };

    return tabService;
});

service.factory('FilterService', function($rootScope) {
    var filterService = {};

    filterService.statusParam = '';

    filterService.prepForBroadcast = function(data) {
        this.statusParam = data;
        this.broadcastItem();
    };

    filterService.broadcastItem = function() {
        $rootScope.$broadcast('filterBroadcast');
    };

    return filterService;
});

service.factory('PurchaseRequestsBoxClickService', function($rootScope) {
    var purchaseRequestsBoxClickService = {};

    purchaseRequestsBoxClickService.statusParam = '';

    purchaseRequestsBoxClickService.prepForBroadcast = function(data) {
        this.statusParam = data;
        this.broadcastItem();       
        
    };

    purchaseRequestsBoxClickService.broadcastItem = function() {
        $rootScope.$broadcast('purchaseRequestsBoxClickService' );
    }
    
    return purchaseRequestsBoxClickService;
});

service.factory('PurchaseOrderBoxClickService', function($rootScope) {
    var purchaseOrderBoxClickService = {};

    purchaseOrderBoxClickService.statusParam = '';

    purchaseOrderBoxClickService.prepForBroadcast = function(data) {
        this.statusParam = data;
        this.broadcastItem();
    };

    purchaseOrderBoxClickService.broadcastItem = function() {
        $rootScope.$broadcast('purchaseOrderBoxClickService' );
    }

    return purchaseOrderBoxClickService;
});

service.factory('PurchaseApprovalBoxClickService', function($rootScope) {
    var purchaseApprovalBoxClickService = {};

    purchaseApprovalBoxClickService.statusParam = '';

    purchaseApprovalBoxClickService.prepForBroadcast = function(data) {
        this.statusParam = data;
        this.broadcastItem();
    };

    purchaseApprovalBoxClickService.broadcastItem = function() {
        $rootScope.$broadcast('purchaseApprovalBoxClickService' );
    }

    return purchaseApprovalBoxClickService;
});

service.factory('LineItem', function ($resource) {
    return $resource('api/purchaseRequests/:requestId/lineItems/:id', {id: '@id', requestId: '@requestId'}, {
        query: {method: 'GET', params: {}, isArray: true},
        save: { method: 'PUT' },
        create: { method: 'POST' },
        destroy: { method: 'DELETE' }
    });
});

service.factory('PurchaseOrderLineItem', function ($resource) {
    return $resource('api/purchase-orders/:orderId/line-items/:id', {id: '@id', orderId: '@orderId'}, {
        query: {method: 'GET', params: {}, isArray: true},
        save: { method: 'PUT' },
        create: { method: 'POST' },
        destroy: { method: 'DELETE' }
    });
});

//update PO Items Qty from PR
service.factory('PurchaseOrdersItemQty', function ($resource) {
    return $resource('api/purchase-orders-qty/:id', {id: '@id'}, {
        save: { method: 'PUT' }
    });
});

service.factory('PurchaseRequest', function ($resource) {
    return $resource('api/purchaseRequests/:id/:cmd', {id: '@id'}, {
        query: {method: 'GET', params: {}},
        summary: {method: 'GET', params: { cmd: "summary"}, isArray: false},
        summaries: {method: 'GET', params: { cmd: "summaries"}, isArray: false},
        orders: {method: 'GET', params: { cmd: "orders"}, isArray: true},
        save: { method: 'PUT' },
        create: { method: 'POST' },
        destroy: { method: 'DELETE' },
        submit: { method: 'POST', params: { cmd: "submit"} }
    });
});

service.factory('PurchaseRequestUnDraft', function ($resource) {
    return $resource('api/purchaseRequestsUnDraft/:cmd', { }, {
        orders: {method: 'GET', params: { cmd: "orders"}},
        allorders: {method: 'GET', params: { cmd: "allorders"}},
        status: {method: 'GET', params: { cmd: "status"}},
        approver: {method: 'GET', params: { cmd: "approver"}}

    });
});

service.factory('Profiles', function ($resource) {
    return $resource('api/profile', {}, {
        query: {method: 'GET', params: {}, isArray: false},
        save: { method: 'PUT' }
    });
});

service.factory('Passwords', function ($resource) {
    return $resource('api/changePassword', {}, {
        save: { method: 'POST' }
    });
});

service.factory('DefaultShippingAddress', function ($resource) {
    return $resource('api/defaultShippingAddress', {}, {
        get: {method: 'GET'},
        save: { method: 'PUT' }
    });
});

service.factory('DefaultCompanyAddress', function ($resource) {
    return $resource('api/default-company-address', {}, {
        get: {method: 'GET'},
        save: { method: 'PUT' }
    });
});

service.factory('DefaultCostCenter', function ($resource) {
    return $resource('api/defaultCostCenter', {}, {
        get: {method: 'GET'},
        save: { method: 'PUT' }
    });
});

service.factory('DefaultCurrency', function ($resource) {
    return $resource('api/defaultCurrency/', {}, {
        get: {method: 'GET'},
        save: { method: 'PUT' }
    });
});

service.factory('Addresses', function ($resource) {
    return $resource('api/addresses/:id', {id: '@id'}, {
        update: {method: 'PUT'}
    });
});

service.factory('CostCenters', function ($resource) {
    return $resource('api/costCenters/:id', {id: '@id'}, {
        update: {method: 'PUT'}
    });
});

service.factory('DefaultCostCenter', function ($resource) {
    return $resource('api/defaultCostCenter', {}, {
        get: {method: 'GET'},
        save: { method: 'PUT' }
    });
});

service.factory('PurchaseTemplate', function ($resource) {
    return $resource('api/purchaseTemplates/:id', {id: '@id'}, {
        query: {method: 'GET', params: {}, isArray: true},
        save: { method: 'PUT' },
        create: { method: 'POST' },
        destroy: { method: 'DELETE' }
    });
});

service.factory('Address', function ($resource) {
    return $resource('api/addresses/:id', {id: '@id'}, {
        query: {method: 'GET', params: {}, isArray: true},
        get: {method: 'GET'},
        save: { method: 'PUT' },
        create: { method: 'POST' },
        destroy: { method: 'DELETE' }
    });
});

service.factory('Users', function ($resource) {
    return $resource('api/users/:id/:cmd', {id: '@id'}, {
        query: {method: 'GET', params: {}, isArray: true},
        get: {method: 'GET'},
        find: {method: 'GET', params: {id:"email", cmd: "email"},isArray:false},
        update: { method: 'PUT' },
        save: { method: 'POST' },
        delete: { method: 'DELETE' }
    });
});

service.factory('ResetEmail', function ($resource) {
    return $resource('api/email', {}, {
        update: { method: 'PUT' }
        });
});

service.factory('UserRoles', function ($resource) {
    return $resource('api/organization/roles/:roleids/users', {}, {});
});

service.factory('Suppliers', function ($resource) {
    return $resource('api/suppliers/:id', {id: '@id'}, {
        query: {method: 'GET', params: {}, isArray: true},
        get: {method: 'GET'},
        update: { method: 'PUT' },
        create: { method: 'POST' },
        delete: { method: 'DELETE' }
    });
});

service.factory('SupplierByUniqueId', function ($resource) {
    return $resource('api/suppliers/uniqueid/:id', {id: '@id'}, {
        query: {method: 'GET', params: {}, isArray: true},
        get: {method: 'GET'}
    });
});

service.factory('ContentManager', function ($resource) {
    return $resource('api/contents/:id', {id: '@id'}, {
        query: {method: 'GET', params: {}, isArray: true},
        get: {method: 'GET'},
        update: { method: 'PUT' },
        create: { method: 'POST' },
        delete: { method: 'DELETE' }
    });
});

service.factory('SearchContent', function ($resource) {
    return $resource('api/searchindex/:id', {id: '@id'}, {
        query: {method: 'GET', params: {}, isArray: true},
        get: {method: 'GET'},
        update: { method: 'PUT' },
        create: { method: 'POST' },
        delete: { method: 'DELETE' }
    });
});

service.factory('BuyerGroupService', function ($resource) {
    return $resource('api/buyer-groups/:id', {id: '@id'}, {
        query: {method: 'GET', params: {}, isArray: true},
        get: {method: 'GET'},
        update: { method: 'PUT' },
        create: { method: 'POST' },
        delete: { method: 'DELETE' }
    });
});

service.factory('DefaultCompanyBuyerGroup', function ($resource) {
    return $resource('api/default-company-buyer-group', {}, {
        get: {method:'GET'}
    });
});

service.factory('BuyerGroupById', function ($resource) {
    return $resource('api/buyer-group', {}, {
        query: {method:'GET', params:{}}
    });
});

service.factory('BuyerGroupByCategoryAndSupplier', function ($resource) {
    return $resource('api/buyer-groups-category', {}, {
        query: {method:'GET', params:{}, isArray:true}
    });
});

service.factory('CompanyCodes', function($resource) {
    return $resource('api/comapanycodes/:id', {id: '@id'}, {
        query: {method:'GET', params:{}, isArray:true},
        get: {method: 'GET'},
        create : { method : 'POST' },
        save : { method : 'PUT' },
        delete : { method : 'DELETE' }
    });
});

service.factory('AssociatedCompanyCodes', function($resource) {
    return $resource('api/ass-comapanycodes/:id', {id: '@id'}, {
        delete : { method : 'DELETE' }
    });
});

service.factory('MaterialGroups', function($resource) {
    return $resource('api/materialgroup/:id', {id: '@id'}, {
        query: {method:'GET', params:{}, isArray:true},
        get: {method: 'GET'},
        create : { method : 'POST' },
        save : { method : 'PUT' },
        delete : { method : 'DELETE' }
    });
});

service.factory('GLAccounts', function($resource) {
    return $resource('api/glaccounts/:id', {id: '@id'}, {
        query: {method:'GET', params:{}, isArray:true},
        get: {method: 'GET'},
        create : { method : 'POST' },
        save : { method : 'PUT' },
        delete : { method : 'DELETE' }
    });
});

service.factory('PaymentTerms', function ($resource) {
    return $resource('api/payment-terms', {}, {
        query: {method: 'GET', params: {}, isArray: true}
    });
});

service.factory('Reports', function ($http, $location) {
//	return $resource('api/reports/:reportId', {reportId: '@reportId'}, {
//        ordersByDays: {method: 'GET', params: {status: '@status', days: '@days'}},
//        ordersByDateRange: {method: 'GET', params: {status: '@status', startDate: '@lastDays', endDate: '@endDate'}},
//    });
	
	var reportsService = {};
	
	var address = 'api/reports/';
	reportsService.ordersByDays = function (reportId, status, days) {
		$location.path( address+reportId+'?status='+status+'&days='+days );
	};
	reportsService.ordersByDateRange = function (reportId, status, startDate, endDate) {
		$location.path( address+reportId+'?status='+status+'&startDate='+startDate+'&endDate='+endDate );
	};
	
	return reportsService;
});
service.factory('UpdatePurchaseRequestSummary', function($rootScope) {
    var updatePurchaseRequestSummary = {};

    updatePurchaseRequestSummary.statusParam = '';

    updatePurchaseRequestSummary.prepForBroadcast = function(data) {
        this.statusParam = data;
        this.broadcastItem();
    };

    updatePurchaseRequestSummary.broadcastItem = function() {
        $rootScope.$broadcast('updatePurchaseRequestSummary');
    };

    return updatePurchaseRequestSummary;
});
service.factory('UpdatePurchaseOrderSummary', function($rootScope) {
    var updatePurchaseOrderSummary = {};

    updatePurchaseOrderSummary.statusParam = '';

    updatePurchaseOrderSummary.prepForBroadcast = function(data) {
        this.statusParam = data;
        this.broadcastItem();
    };

    updatePurchaseOrderSummary.broadcastItem = function() {
        $rootScope.$broadcast('updatePurchaseOrderSummary');
    };

    return updatePurchaseOrderSummary;
});





