"use strict";

service.factory('QuickRfxs', function ($resource) {
    return $resource('api/buyRoutesItems/', {
        query: {method: 'GET', params: {}},
    });
});

service.factory('QuickRfx', function ($resource) {
    return $resource('api/quotation-request', {quotationRequestId: '@quotationRequestId'}, {
       query: { method: 'GET' },
    });
});

// service.factory('QuickRfx', function ($resource) {
//     return $resource('api/quotation-request', {suppliers : '@suppliersIDs'}, {
//        create: { method: 'POST' },
//     });
// });

// service.factory('QuickQuote', function ($resource) {
//     return $resource('api/quotation-request/:quotationRequestId', {
//        get: { method: 'GET', params: {quotationRequestId: '@quotationRequestId'}, isArray: false},
//     });
// });

service.factory('LineItems', function ($resource) {
    var lineItem = [];

    var addLineItem = function(newitem){
        //lineItem.push(newitem);
        lineItem[0] = newitem;
    }

    var getItems = function(){
        return lineItem;
    }

    return {
        addLineItem: addLineItem,
        getItems: getItems
    };

});
