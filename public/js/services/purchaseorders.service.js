"use strict";

service.factory('PurchaseOrders', function ($resource) {
  return $resource('api/purchaseOrders/:id/:cmd', {id: '@id'}, {
      query: {method: 'GET', params: {}},
      poquery: {method: 'GET', params: {}, isArray: true}
  });
});


service.factory('PurchaseOrder', function ($resource) {
    return $resource('api/purchase-orders/:id/:cmd', {id: '@id'}, {
        query: {method: 'GET', params: {}, isArray: true},
        summary: {method: 'GET', params: { cmd: "summary"}, isArray: false},
        orders: {method: 'GET', params: { cmd: "orders"}, isArray: true},
        save: { method: 'PUT' },
        create: { method: 'POST' },
        destroy: { method: 'DELETE' },
        submit: { method: 'POST', params: { cmd: "submit"} }
    });
});

