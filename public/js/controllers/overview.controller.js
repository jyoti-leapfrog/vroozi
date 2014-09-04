'use strict';

function NotificationCtrl ($scope, $timeout, Notifications) {
    $scope.notifications = Notifications.query();
}

function BuyRouteOrdersOverviewCtrl ($scope, $rootScope, $location, $http, QuickRfxs, LineItems) {
    $scope.quickrfx = [];
    $scope.buyRouteQuotationRequests = [];

    // pagination
     $scope.curPage = 0;
     $scope.pageSize = 5;


    QuickRfxs.query(function(data){
        $scope.quickrfx = data;
    });

    $scope.newQuote = function(){
        $location.path("/quickrfx/");
    }

    $scope.selectedRfx = [];

    $scope.selectionChangeRfx = function(selected){

        var idx = $scope.selectedRfx.indexOf(selected);

        if(idx > -1) {
            $scope.selectedRfx.splice(idx, 1);
        } else {
            $scope.selectedRfx.push(selected);
            LineItems.addLineItem(selected);
        }
    }

    $scope.quotationtopurchaserequest = function(){
        $http({method: 'POST', url: '/quotations/to/purchase-request' })
        .success(function(data, status, headers,config) {
            console.log(JSON.stringify(data));
            // $location.path("/");
            // noty({text: "You accepted a quotation.", type: "warning"});
        }).error (function (data, status, headers,config){

        });
    }
    $scope.showQuotes = function (index) {
        var buyRoute = $scope.quickrfx[index];
        $scope.buyRouteQuotationRequests = buyRoute.quotations;

        console.log(buyRoute.quotations);
    }

    $scope.quickrfxnumberOfPages = function() {
        return Math.ceil($scope.datalists.length / $scope.pageSize);
    }
}

function PurchaseOrdersOverviewCtrl ($scope,$routeParams, $rootScope, PurchaseOrders, PurchaseOrder, QuickRfx, MessageService, LineItem,Profiles,PurchaseOrderBoxClickService) {
    $scope.currentPage = 1;
    $scope.pageSize = 5;
    var state = $routeParams.status;
    if( state && state.indexOf('-BUYER') != -1){
        state = state.split('-').slice(0,1).join();
    }else{
        state = null;
    }
    var status = {status:state};
    status.currentPage = $scope.currentPage;
    status.pageSize = $scope.pageSize;
    $rootScope.currentPurchaseOrder = undefined;
    $rootScope.currentRequest = undefined;
    var isBuyer = false;
    var employeeOnly = false;
    var isApprover = false;
    $scope.isAdminAndBuyer = false;
    $rootScope.lastClickByBuyer = '';
    $scope.prevStatePrOrders = '';



    Profiles.query(function(user){
        if(null != user.rolesPerApp && user.rolesPerApp.purchaseManagerRoles.length > 0){
            for(var i=0; i<user.rolesPerApp.purchaseManagerRoles.length; i++) {
                if(user.rolesPerApp.purchaseManagerRoles[i] == 'Buyer'){
                    isBuyer = true;
                }else if(user.rolesPerApp.purchaseManagerRoles[i] == 'Admin'){
                    $scope.isAdmin = true;
                }else if(user.rolesPerApp.purchaseManagerRoles[i] == 'Employee'){
                    employeeOnly = true;
                }else if(user.rolesPerApp.purchaseManagerRoles[i] == 'Approver'){
                    isApprover = true;
                }
            }
        }
        if(isBuyer && $scope.isAdmin){
            $scope.isAdminAndBuyer = true;
        }
        if(isApprover && isBuyer && user.rolesPerApp.purchaseManagerRoles.length == 2){
            $rootScope.buyerApprover = true;
        }
        if($scope.isAdmin && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.adminOnly = true;
        }
        if(isApprover && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.approverOnly = true;
        }
        if(isBuyer && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.buyerOnly = true;
        }
        if(employeeOnly && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.employeeOnly = true;
        }
        if(isBuyer && user.rolesPerApp.purchaseManagerRoles.length > 1){
            $rootScope.rolesWithBuyer = true;
        }
        if(!isBuyer && user.rolesPerApp.purchaseManagerRoles.length > 1){
            $rootScope.rolesWithoutBuyer = true;
        }

        $scope.prevStatePrOrders = status;
        PurchaseOrders.query(status, function  (data) {
            //        alert('in orders');
            $scope.orders = data.resultsOrders;
            MessageService.publish('updatePurchaseOrderSummary');
            $scope.numberOfPagesOrders= data.numberOfPages==undefined ? '0': data.numberOfPages;
//            MessageService.publish('updateOrdersSummary');
        });


//         QuickRfx.query(status, function  (data) {
//             $scope.quickrfx = data.resultsOrders;
//             //MessageService.publish('updatePurchaseOrderSummary');
//             $scope.numberOfPagesOrders= data.numberOfPages==undefined ? '0': data.numberOfPages;
// //            MessageService.publish('updateOrdersSummary');
//         });
    });

    $scope.numberOfPages = function(type){

        if ( type == 'myOrders' && $scope.orders ) {
            return Math.ceil($scope.orders.length/$scope.pageSize);
        } else {
            return 0;
        }
    };

    $scope.orderTotalAmount = function (order) {
        var subTotal = 0.00;
        var shippingCharges = 0.00;
        var taxAmount = 0.00;
        var currencyCode = '';
        if(typeof order === 'undefined' || typeof order.items === 'undefined'){
            // todo   task
        }else{
            for( var t=0; t < order.items.length; t++) {
                shippingCharges += order.items[t].shippingCharges != null ? parseFloat(order.items[t].shippingCharges) : 0.00;
                taxAmount += order.items[t].taxableAmount != null ? parseFloat(order.items[t].taxableAmount) : 0.00;
                subTotal += (order.items[t].unitPrice*order.items[t].qty);
                if (currencyCode === '') {
                    currencyCode = order.items[t].currency;
                } else if (currencyCode != order.items[t].currency) {
                    currencyCode = 'MIXED'
                }
            }
        }
        return (subTotal + shippingCharges + taxAmount).toFixed(2);

    };

    $scope.deletePurchaseOrder = function(orderNumber,id) {
        if (confirm("Are you sure you want to delete the purchase order #" + orderNumber + "?")) {
            PurchaseOrder.destroy({id: id},function() {
                noty({text: "Your purchase order " + orderNumber + " has been deleted.", type: "warning"});
                var state = $scope.prevStatePrOrders;
                state.currentPage = $scope.currentPage;
                state.pageSize = $scope.pageSize;
                PurchaseOrders.query(status, function  (data) {
                    //        alert('in orders');
                    $scope.orders = data.resultsOrders;
                    $scope.numberOfPagesOrders= data.numberOfPages==undefined ? '0': data.numberOfPages;
                    MessageService.publish('updateOrdersSummary');
                });
                $rootScope.currentPurchaseOrder = undefined;
            });
        }
    };

    $scope.getMyPrOrder = function (){
        // To be implemented once buyer groups are introduced
//        PurchaseOrder.query({"status":"myPOrders"}, function  (data) {
//            $scope.orders = data;
//            $rootScope.lastClickByBuyer = 'myOrders';
//            MessageService.publish('updateOrdersSummary');
//        });
    }
    $scope.getAllPrOrder = function (){
        // To be implemented once buyer groups are introduced
//        PurchaseOrder.query({"status":"allPOrders"}, function  (data) {
//            $scope.orders = data;
//            $rootScope.lastClickByBuyer = 'allOrders';
//            MessageService.publish('updateOrdersSummaryPrRequest');
//        });
    }

    $scope.$on('purchaseOrderBoxClickService', function(event) {
        var status1 = PurchaseOrderBoxClickService.statusParam;
        var status2 = $rootScope.lastClickByBuyer;
        var status = '';
        if(status2){
            status = status1 + "-" + status2;
        }else{
            status = status1 + "-" + "null";
        }
        $scope.prevStatePrOrders = {"status":status,"currentPage":1,"pageSize":$scope.pageSize};
        PurchaseOrders.query({"status":status,"currentPage":1,"pageSize":$scope.pageSize}, function  (data) {
            $scope.orders = data.resultsOrders;
            $scope.numberOfPagesOrders= data.numberOfPages==undefined ? '0': data.numberOfPages;
        });
    });

    $scope.onSelectPage = function (page){
        var objPrevStateApprover = $scope.prevStatePrOrders;
        //over Writing currentPage with selected page.
        objPrevStateApprover.currentPage = page;
        PurchaseOrders.query(objPrevStateApprover, function  (data) {
            $scope.orders = data.resultsOrders;
            $scope.numberOfPagesOrders= data.numberOfPages==undefined ? '0': data.numberOfPages;
        });
    }
}

function RequestsOverviewCtrl ($scope,$routeParams, $rootScope, $location, PurchaseRequest, MessageService, LineItem, PurchaseRequestUnDraft, FilterService,Profiles,FilterSummary,PurchaseRequestsBoxClickService,$route,PurchaseApprovalBoxClickService,TabService, PurchaseOrderLineItem,PurchaseOrders, PurchaseOrder, PurchaseOrdersItemQty) {
    var parentStatus = $routeParams.parentStatus;
    var state = $routeParams.status;
    var stateAdmin = '';
    var stateApprover = '';
    var status = '';
    var isApprover = false;
    var isAdmin = false;
    var isBuyer = false;
    var lastAdminClick = $rootScope.lastClickByAdmin;
    var lastApproverClick = $rootScope.lastClickByApprover;
    var lastBuyerClick = $rootScope.lastClickByBuyer;

    $scope.logOrder = function(orders){
        console.log(orders);
    }

    if((state && state.indexOf('-ADMIN') != -1)){
        stateAdmin = state.split('-').slice(0,1).join();
        if($rootScope.lastClickByAdmin && $rootScope.lastClickByAdmin == 'allRequests')
            stateAdmin = stateAdmin+"-allRequests";
        else if($rootScope.lastClickByAdmin && $rootScope.lastClickByAdmin == 'myRequests')
            stateAdmin = stateAdmin+"-myRequests";
    }
    //if((state && state.indexOf('-APPROVER') != -1)){
    //  stateApprover = state.split('-').slice(0,1).join();
    //}
    else if(lastAdminClick && lastAdminClick == 'allRequests'){
        state = "allRequests";
    }else if(lastAdminClick && lastAdminClick == 'myRequests'){
        state = "myRequests";
    }
    else{
        state = null;
    }
    //if(!stateAdmin && !stateApprover){
    if(!stateAdmin){
        status = {status:state};
        stateAdmin = {status:state,pageSize:5,currentPage:1};
    }else if(stateAdmin){
        var isAdmin = true;
        stateAdmin = {status:stateAdmin,pageSize:5,currentPage:1};
//        $rootScope.lastClickByApprover = 'myApprover';
    }
    //else if(stateApprover){
    //  isApprover = true;
    //stateAdmin = {status:null,pageSize:5,currentPage:1};
    //$rootScope.lastClickByAdmin = 'myRequests';
    //}
    $scope.currentPage = 1;
    $scope.pageSize = 5;
    $scope.purchaseRequestsBoxClickStatus = '';
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    var adminOnly = false;
    var approverOnly = false;
    var employeeOnly = false;
    var buyerOnly = false;
    var buyerApprover = false;
    $scope.rejectedOrders = [];
    $scope.approvedOrders = [];
    $scope.pendingOrders = [];
    $scope.isAdmin = false;
    var isApprover = false;
    $scope.isApproverAndAdmin = false;
    $rootScope.rolesWithBuyer = false;
    var orderLength = 0;
    var flag = false;



    Profiles.query(function(user){
        $scope.approverEmail = user.email;
        if(null != user.rolesPerApp && user.rolesPerApp.purchaseManagerRoles.length > 0){
            for(var i=0; i<user.rolesPerApp.purchaseManagerRoles.length; i++) {
                if(user.rolesPerApp.purchaseManagerRoles[i] == 'Admin'){
                    $scope.isAdmin = true;
                }else if(user.rolesPerApp.purchaseManagerRoles[i] == 'Approver'){
                    isApprover = true;
                }else if(user.rolesPerApp.purchaseManagerRoles[i] == 'Buyer'){
                    isBuyer = true;
                }
                else if(user.rolesPerApp.purchaseManagerRoles[i] == 'Employee'){
                    employeeOnly = true;
                }
            }
        }
        if(isApprover && isBuyer && user.rolesPerApp.purchaseManagerRoles.length == 2){
            $rootScope.buyerApprover = true;
        }
        if($scope.isAdmin && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.adminOnly = true;
        }
        if(isApprover && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.approverOnly = true;
        }
        if(isBuyer && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.buyerOnly = true;
        }
        if(employeeOnly && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.employeeOnly = true;
        }
        if(isBuyer && user.rolesPerApp.purchaseManagerRoles.length > 1){
            $rootScope.rolesWithBuyer = true;
        }
        if(!isBuyer && user.rolesPerApp.purchaseManagerRoles.length > 1){
            $rootScope.rolesWithoutBuyer = true;
        }

        PurchaseRequest.query(stateAdmin, function  (data) {
            $scope.orders = data.results;
            $scope.numberOfPages = data.numberOfPages;
            if(!isAdmin){
                if(lastAdminClick && lastAdminClick == 'allRequests'){
                    MessageService.publish('updateAllOrdersSummary');
                }else if(lastAdminClick && lastAdminClick == 'myRequests'){
                    MessageService.publish('updateOrdersSummary');
                }else if(!lastAdminClick)
                    MessageService.publish('updateOrdersSummary');
            }else{
//                MessageService.publish('updateAllOrdersSummary');
            }
        });
    });

    $scope.$on('filterBroadcast', function() {
        $scope.broadcastParam = FilterService.statusParam;
        $scope.approverOrders = {};
        if($scope.broadcastParam == 'APPROVED'){
            $scope.approverOrders = $scope.approvedOrders;
        }else if($scope.broadcastParam == 'PENDING'){
            $scope.approverOrders = $scope.pendingOrders;
        }else if($scope.broadcastParam == 'REJECTED'){
            $scope.approverOrders = $scope.rejectedOrders;
        }
        $scope.currentPage = 1;
        MessageService.publish('showOrders');
    });

//    $scope.numberOfPagesApprover = function(type){
//
//        if ( type == 'myOrders' && $scope.orders ) {
//            return Math.ceil($scope.orders.length/$scope.pageSize);
//        } else if ( type == 'approvalOrders' && $scope.approverOrders != undefined && $scope.approverOrders) {
//            return Math.ceil($scope.approverOrders.length/$scope.pageSize);
//        } else {
//            return 0;
//        }
//    };

    $scope.deleteOrder = function(orderNumber,id) {
        if (confirm("Are you sure you want to delete the purchase request #" + orderNumber + "?")) {
            PurchaseRequest.destroy({id: id},function() {
                noty({text: "Your purchase request " + orderNumber + " has been deleted.", type: "warning"});
                var obj = ''
                if($scope.purchaseRequestsBoxClickStatus){
                    obj = {"status":$scope.purchaseRequestsBoxClickStatus,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize};
                }else{
                    stateAdmin.currentPage = $scope.currentPage;
                    obj = stateAdmin;
                }
                PurchaseRequest.query(obj, function  (data) {
                    $scope.orders = data.results;
                    $scope.numberOfPages = data.numberOfPages;
                    MessageService.publish('updateOrdersSummary');
                });
                $rootScope.currentRequest = undefined;
            });
        }
    };

    $scope.purchaseOrder = function (id,index) {
        LineItem.query({requestId: id}, function (data) {
            $scope.lineItems = data;
            $scope.saveMsgShow = "false";
            if($scope.this.orders[0].orderNumber != null){
                $scope.creationDate = $scope.this.orders[index].createdDate;
                var requestNumber = $scope.this.orders[0].orderNumber;
                $scope.requestNumber = requestNumber.substring(1,requestNumber.length);
            }
            for (var i=0;i<$scope.lineItems.length;i++){
                var lineItem = $scope.lineItems[i];
                if(lineItem.goodsNotes == null || lineItem.goodsNotes == undefined || lineItem.goodsNotes == ""){
                    lineItem.disableInput = false;
                    $scope.saveMsgShow = true;
                    lineItem.qtyNew = lineItem.qty;
                }else if(lineItem.qty>lineItem.qtyNew){
                    lineItem.disableInput = false;
                    $scope.saveMsgShow = true;
                }else{
                    lineItem.disableInput = true;
                }
                if(!lineItem.deliveryDateForGoods){
                    lineItem.deliveryDateForGoods =  new Date(moment());
                }
            }
            $('#lineItemOverlayItem').modal('show');
//            calculateOrderTotalAmounts(data);
//            resetItem();
        });

    }

    $scope.blurCallback = function(i, lineItem){

        if(lineItem.qtyNew != null){
            if ($scope.lineItems[i].qty < lineItem.qtyNew){
                $scope.showIt = true;
                $scope.lineItems[i].qtyNew = $scope.lineItems[i].qty;
                noty({text: "The received quantity can not be greater than the ordered quantity.", type: "warning"});
            }else if($scope.lineItems[i].qty > lineItem.qtyNew){
                noty({
                    text: 'Are you expecting more deliveries for this item?',
                    modal: true,
                    buttons: [
                        {addClass: 'btn btn-primary', text: 'Yes', onClick: function($noty) {
                            $noty.close();
                            //do nothing
                        }
                        },
                        {addClass: 'btn btn-primary', text: 'No', onClick: function($noty) {

                            var elementId = "#qty"+i
                            $(elementId).val(lineItem.qtyNew);
                            $scope.lineItems[i].qty = lineItem.qtyNew;
                            $noty.close();
                        }
                        }
                    ]
                });
            }
        }
    }

    $scope.orderLineItem = function (lineItems) {
        var requestId = "" ;
        lineItems.forEach(function(lineItem){
            if(lineItem.deliveryDateForGoods)
                lineItem.deliveryDateForGoods = new Date(moment(lineItem.deliveryDateForGoods));
            requestId = lineItem.requestId;
        });
        $routeParams.id = requestId;
        PurchaseRequest.get({id: $routeParams.id}, function (data) {
            $scope.purchaseRequest = data;
            $scope.purchaseRequest.items = undefined;
            $scope.purchaseRequest.items = lineItems;
            PurchaseRequest.save($scope.purchaseRequest,function(data){
                PurchaseOrdersItemQty.save({id:requestId}, function(data){
                    noty({text: "Goods receipt number posted successfully.", type: "warning"});
                });

            });
        });
        $('.modal').modal('hide');
    }

    $scope.orderTotalAmount = function (order) {
        var subTotal = 0.00;
        var shippingCharges = 0.00;
        var taxAmount = 0.00;
        var currencyCode = '';
        if(typeof order === 'undefined' || typeof order.items === 'undefined'){
            // todo   task
        }else{
            for( var t=0; t < order.items.length; t++) {
                shippingCharges += order.items[t].shippingCharges != null ? parseFloat(order.items[t].shippingCharges) : 0.00;
                taxAmount += order.items[t].taxableAmount != null ? parseFloat(order.items[t].taxableAmount) : 0.00;
                subTotal += (order.items[t].unitPrice*order.items[t].qty);
                if (currencyCode === '') {
                    currencyCode = order.items[t].currency;
                } else if (currencyCode != order.items[t].currency) {
                    currencyCode = 'MIXED'
                }
            }
        }
        return (subTotal + shippingCharges + taxAmount).toFixed(2);

    };

    $scope.$on('showOrders', function(event) {
        $scope.approverOrders = $scope.approverOrders;
    });


    //set pill state based on last click
    if(lastAdminClick && lastAdminClick=='allRequests'){
        $scope.switchLabel = 'All';

        $('#requestSwitchOptions').css("margin-right","11px");
        $('#requestSwitchOptions').removeClass("pull-left");
        $('#requestSwitchOptions').addClass("pull-right");

        $('#requestSwitchButton').removeClass("pull-right");
        $('#requestSwitchButton').addClass("pull-left");

    }else if(lastAdminClick && lastAdminClick=='myRequests'){
        $scope.switchLabel = 'Mine'

        $('#requestSwitchOptions').css("margin-right","3px");
        $('#requestSwitchOptions').addClass("pull-left");
        $('#requestSwitchOptions').removeClass("pull-right");

        $('#requestSwitchButton').addClass("pull-right");
        $('#requestSwitchButton').removeClass("pull-left");

    }

    $scope.requestSwitch = function(){
        if($scope.switchLabel == 'Mine'){
            $scope.switchLabel = 'All'

            $('#requestSwitchOptions').css("margin-right","11px");
            $('#requestSwitchOptions').addClass("pull-right");
            $('#requestSwitchOptions').removeClass("pull-left");

            $('#requestSwitchButton').addClass("pull-left");
            $('#requestSwitchButton').removeClass("pull-right");

            $scope.getAllPrRequest();
        }else if($scope.switchLabel == 'All'){
            $scope.switchLabel = 'Mine'

            $('#requestSwitchOptions').css("margin-right","3px");
            $('#requestSwitchOptions').addClass("pull-left");
            $('#requestSwitchOptions').removeClass("pull-right");

            $('#requestSwitchButton').addClass("pull-right");
            $('#requestSwitchButton').removeClass("pull-left");
            $scope.getMyPrRequest();
        }

    }

    $scope.getMyPrRequest = function (){
        PurchaseRequest.query({"status":"myRequests","currentPage":$scope.currentPage,"pageSize":$scope.pageSize}, function  (data) {
            $scope.orders = data.results;
            $scope.numberOfPages = data.numberOfPages;
            $rootScope.lastClickByAdmin = 'myRequests';
            MessageService.publish('updateOrdersSummary');
        });
    }
    $scope.getAllPrRequest = function (){
        PurchaseRequest.query({"status":"allRequests","currentPage":$scope.currentPage,"pageSize":$scope.pageSize}, function  (data) {
            $scope.orders = data.results;
            $scope.numberOfPages = data.numberOfPages;
            $rootScope.lastClickByAdmin = 'allRequests';
            MessageService.publish('updateAllOrdersSummary');
        });
        $scope.purchaseRequestsBoxClickStatus = '';
    }
    $scope.switchLabelApprover = "Mine"

    $scope.$on('purchaseRequestsBoxClickService', function(event) {
        var status1 = PurchaseRequestsBoxClickService.statusParam;
        var status2 = $rootScope.lastClickByAdmin;
        var status = '';
        var statusPagination = '';
        if(status2){
            status = status1 + "-" + status2;
        }else{
            status = status1 + "-" + "null";
        }
        $scope.purchaseRequestsBoxClickStatus = status;
        statusPagination = {"status":status,"currentPage":1,"pageSize":$scope.pageSize}
        PurchaseRequest.query(statusPagination, function  (data) {
            $scope.orders = data.results;
            $scope.numberOfPages = data.numberOfPages;
        });
    });

    $scope.onSelectPage = function (page){
        var tabSelected = TabService.tabParam;
        if(tabSelected && tabSelected =='purchaseRequest'){
            var stateAdminPagination = '';
            if($scope.purchaseRequestsBoxClickStatus && $scope.purchaseRequestsBoxClickStatus != ''){
                stateAdminPagination = {"status":$scope.purchaseRequestsBoxClickStatus,"currentPage":page,"pageSize":$scope.pageSize};
            }else if($rootScope.prRequestStatus && $rootScope.prRequestStatus != '' ){
                var status = '';
                var state1 = $rootScope.prRequestStatus;
                var state2 = $rootScope.lastClickByAdmin;
                if(state2){
                    status = state1 + "-" + state2;
                }else{
                    status = state1 + "-" + "null";
                }
                stateAdminPagination = {"status":status,"currentPage":page,"pageSize":$scope.pageSize};
            }else if(!$rootScope.lastClickByAdmin || $rootScope.lastClickByAdmin == '')
                stateAdminPagination = {"status":status.status,"currentPage":page,"pageSize":$scope.pageSize};
            else{
                stateAdminPagination = {"status":$rootScope.lastClickByAdmin,"currentPage":page,"pageSize":$scope.pageSize};
            }

            PurchaseRequest.query(stateAdminPagination, function  (data) {
                $scope.orders = data.results;
                $scope.numberOfPages = data.numberOfPages;
            });
        }
    }
}

function ApproverOverviewCtrl ($scope,$routeParams, $rootScope, $location, PurchaseRequest, MessageService, LineItem, PurchaseRequestUnDraft, FilterService,Profiles,FilterSummary,PurchaseRequestsBoxClickService,$route,PurchaseApprovalBoxClickService,TabService) {
    var parentStatus = $routeParams.parentStatus;
    var state = $routeParams.status;
    var stateAdmin = '';
    var stateApprover = '';
    var status = '';
    var isApprover = false;
    var isAdmin = false;
    var isBuyer = false;
    var lastAdminClick = $rootScope.lastClickByAdmin;
    var lastApproverClick = $rootScope.lastClickByApprover;
    var lastBuyerClick = $rootScope.lastClickByBuyer;

    if((state && state.indexOf('-APPROVER') != -1)){
        stateApprover = state.split('-').slice(0,1).join();
    }else if(lastApproverClick && lastApproverClick == 'allApprover'){
        state = "allApprover";
    }else if(lastApproverClick && lastApproverClick == 'myApprover'){
        state = "myApprover";
    }
    else{
        state = null;
    }
    //if(!stateAdmin && !stateApprover){
    if(!stateApprover){
        status = {status:state};
        stateAdmin = {status:state,pageSize:5,currentPage:1};
    }
    else if(stateApprover){
        isApprover = true;
        stateAdmin = {status:null,pageSize:5,currentPage:1};
//        $rootScope.lastClickByAdmin = 'myRequests';
    }
    $scope.currentPage = 1;
    $scope.pageSize = 5;
    $scope.purchaseRequestsBoxClickStatus = '';
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    var adminOnly = false;
    var approverOnly = false;
    var employeeOnly = false;
    var buyerOnly = false;
    var buyerApprover = false;
    $scope.rejectedOrders = [];
    $scope.approvedOrders = [];
    $scope.pendingOrders = [];
    $scope.isAdmin = false;
    $scope.isApprover = false;
    $scope.isApproverAndAdmin = false;
    $rootScope.rolesWithBuyer = false;
    $scope.switchLabelApprover = "Mine"
    var orderLength = 0;
    var flag = false;

    Profiles.query(function(user){
        $scope.approverEmail = user.email;
        if(null != user.rolesPerApp && user.rolesPerApp.purchaseManagerRoles.length > 0){
            for(var i=0; i<user.rolesPerApp.purchaseManagerRoles.length; i++) {
                if(user.rolesPerApp.purchaseManagerRoles[i] == 'Admin'){
                    $scope.isAdmin = true;
                }else if(user.rolesPerApp.purchaseManagerRoles[i] == 'Approver'){
                    $scope.isApprover = true;
                }else if(user.rolesPerApp.purchaseManagerRoles[i] == 'Buyer'){
                    isBuyer = true;
                }
                else if(user.rolesPerApp.purchaseManagerRoles[i] == 'Employee'){
                    employeeOnly = true;
                }
            }
        }
        if($scope.isAdmin && $scope.isApprover){
            $scope.isApproverAndAdmin = true;
        }

        if($scope.isApprover && isBuyer && user.rolesPerApp.purchaseManagerRoles.length == 2){
            $rootScope.buyerApprover = true;
        }
        if($scope.isAdmin && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.adminOnly = true;
        }
        if($scope.isApprover && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.approverOnly = true;
        }
        if(isBuyer && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.buyerOnly = true;
        }
        if(employeeOnly && user.rolesPerApp.purchaseManagerRoles.length == 1){
            $rootScope.employeeOnly = true;
        }
        if(isBuyer && user.rolesPerApp.purchaseManagerRoles.length > 1){
            $rootScope.rolesWithBuyer = true;
        }
        if(!isBuyer && user.rolesPerApp.purchaseManagerRoles.length > 1){
            $rootScope.rolesWithoutBuyer = true;
        }

        if(isApprover){
            if($rootScope.lastClickByApprover == undefined) {
                //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
                $scope.prevApproverFunction = 'status';
                $scope.prevStateApprover = {"approverEmail":$scope.approverEmail,status:stateApprover};
                PurchaseRequestUnDraft.status({"approverEmail":$scope.approverEmail,status:stateApprover,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                    $scope.approverOrders = data.results;
                    $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
//                    FilterSummary.prepForBroadcast(data.pendingCount);
                });

            } else if($rootScope.lastClickByApprover && $rootScope.lastClickByApprover == 'myApprover'){
                //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
                $scope.prevApproverFunction = 'status';
                $scope.prevStateApprover = {"approverEmail":$scope.approverEmail,status:stateApprover};
                PurchaseRequestUnDraft.status({"approverEmail":$scope.approverEmail,status:stateApprover,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                    $scope.approverOrders = data.results;
                    $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
//                    FilterSummary.prepForBroadcast(data.pendingCount);
                });
            }else{
                //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
                $scope.prevApproverFunction = 'status';
                $scope.prevStateApprover = {"approverEmail":null,status:stateApprover};
                PurchaseRequestUnDraft.status({"approverEmail":null,status:stateApprover,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                    $scope.approverOrders = data.results;
                    $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
//                    FilterSummary.prepForBroadcast(data.pendingCount);
                });
            }
        }else if($scope.isAdmin && !$scope.isApprover){
            $rootScope.lastClickByApprover = 'allApprover';
            //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
            $scope.prevApproverFunction = 'allorders';
            $scope.prevStateApprover = '';
            PurchaseRequestUnDraft.allorders({"currentPage":1,"pageSize":$scope.pageSize},function  (data) {
                $scope.approverOrders = data.results;
                $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
                var pending = data.pendingCount==undefined?'0':data.pendingCount;
                var approved = data.approvedCount==undefined?'0':data.approvedCount;
                var rejected = data.rejectedCount==undefined?'0':data.rejectedCount;
                var countAll = {"pending":pending,"approved":approved,"rejected":rejected};
                FilterSummary.prepForBroadcast(countAll);
            });
        }else if(!$scope.isAdmin && $scope.isApprover){
            //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
            $scope.prevApproverFunction = 'approver';
            $scope.prevStateApprover = {"approverEmail":$scope.approverEmail};
            PurchaseRequestUnDraft.approver({"approverEmail":$scope.approverEmail,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                $scope.approverOrders = data.results;
                $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
                var pending = data.pendingCount==undefined?'0':data.pendingCount;
                var approved = data.approvedCount==undefined?'0':data.approvedCount;
                var rejected = data.rejectedCount==undefined?'0':data.rejectedCount;
                var countAll = {"pending":pending,"approved":approved,"rejected":rejected};
                FilterSummary.prepForBroadcast(countAll);
            });
        }else{
            //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
            $scope.prevApproverFunction = 'orders';
            $scope.prevStateApprover = {"approverEmail":$scope.approverEmail};

            if(lastApproverClick && lastApproverClick == 'myApprover'){
                $scope.prevApproverFunction = 'orders';
                $scope.prevStateApprover = {"approverEmail":$scope.approverEmail};

                PurchaseRequestUnDraft.orders({"approverEmail":$scope.approverEmail,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                    $scope.approverOrders = data.results;
                    $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
                    var pending = data.pendingCount==undefined?'0':data.pendingCount;
                    var approved = data.approvedCount==undefined?'0':data.approvedCount;
                    var rejected = data.rejectedCount==undefined?'0':data.rejectedCount;
                    var countAll = {"pending":pending,"approved":approved,"rejected":rejected};
                    FilterSummary.prepForBroadcast(countAll);
                });
            }else if(lastApproverClick && lastApproverClick == 'allApprover'){
                $scope.prevApproverFunction = 'allorders';
                $scope.prevStateApprover = '';
                PurchaseRequestUnDraft.allorders({"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                    $scope.approverOrders = data.results;
                    $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
                    var pending = data.pendingCount==undefined?'0':data.pendingCount;
                    var approved = data.approvedCount==undefined?'0':data.approvedCount;
                    var rejected = data.rejectedCount==undefined?'0':data.rejectedCount;
                    var countAll = {"pending":pending,"approved":approved,"rejected":rejected};
                    FilterSummary.prepForBroadcast(countAll);
                    $rootScope.lastClickByApprover = 'allApprover';
                    //MessageService.publish('updateOrdersSummary');
                    orderLength =  $scope.approverOrders.length;
                });
            }else{
                PurchaseRequestUnDraft.orders({"approverEmail":$scope.approverEmail,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                    $scope.approverOrders = data.results;
                    $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
                    var pending = data.pendingCount==undefined?'0':data.pendingCount;
                    var approved = data.approvedCount==undefined?'0':data.approvedCount;
                    var rejected = data.rejectedCount==undefined?'0':data.rejectedCount;
                    var countAll = {"pending":pending,"approved":approved,"rejected":rejected};
                    FilterSummary.prepForBroadcast(countAll);
                });
            }
        }
    });

    $scope.$on('filterBroadcast', function() {
        $scope.broadcastParam = FilterService.statusParam;
        $scope.approverOrders = {};
        if($scope.broadcastParam == 'APPROVED'){
            $scope.approverOrders = $scope.approvedOrders;
        }else if($scope.broadcastParam == 'PENDING'){
            $scope.approverOrders = $scope.pendingOrders;
        }else if($scope.broadcastParam == 'REJECTED'){
            $scope.approverOrders = $scope.rejectedOrders;
        }
        $scope.currentPage = 1;
        MessageService.publish('showOrders');
    });

    $scope.numberOfPagesApprover = function(type){

        if ( type == 'myOrders' && $scope.orders ) {
            return Math.ceil($scope.orders.length/$scope.pageSize);
        } else if ( type == 'approvalOrders' && $scope.approverOrders != undefined && $scope.approverOrders) {
            return Math.ceil($scope.approverOrders.length/$scope.pageSize);
        } else {
            return 0;
        }
    };

    $scope.purchaseOrder = function (id,index) {
        LineItem.query({requestId: id}, function (data) {
            $scope.lineItems = data;
            $scope.saveMsgShow = "false";
            if($scope.this.orders[0].orderNumber != null){
                $scope.creationDate = $scope.this.orders[index].createdDate;
                var requestNumber = $scope.this.orders[0].orderNumber;
                $scope.requestNumber = requestNumber.substring(1,requestNumber.length);
            }
            for (var i=0;i<$scope.lineItems.length;i++){
                var lineItem = $scope.lineItems[i];
                if(lineItem.goodsNotes == null || lineItem.goodsNotes == undefined || lineItem.goodsNotes == ""){
                    lineItem.disableInput = false;
                    $scope.saveMsgShow = "true";
                    lineItem.qtyNew = lineItem.qty;
                }else{
                    lineItem.disableInput = true;
                }

            }
            $('#lineItemOverlayItem').modal('show');
//            calculateOrderTotalAmounts(data);
//            resetItem();
        });

    }

    $scope.orderTotalAmount = function (order) {
        var subTotal = 0.00;
        var shippingCharges = 0.00;
        var taxAmount = 0.00;
        var currencyCode = '';
        if(typeof order === 'undefined' || typeof order.items === 'undefined'){
            // todo   task
        }else{
            for( var t=0; t < order.items.length; t++) {
                shippingCharges += order.items[t].shippingCharges != null ? parseFloat(order.items[t].shippingCharges) : 0.00;
                taxAmount += order.items[t].taxableAmount != null ? parseFloat(order.items[t].taxableAmount) : 0.00;
                subTotal += (order.items[t].unitPrice*order.items[t].qty);
                if (currencyCode === '') {
                    currencyCode = order.items[t].currency;
                } else if (currencyCode != order.items[t].currency) {
                    currencyCode = 'MIXED'
                }
            }
        }
        return (subTotal + shippingCharges + taxAmount).toFixed(2);

    };

    $scope.$on('showOrders', function(event) {
        $scope.approverOrders = $scope.approverOrders;
    });

    //set pill state based on last click
    if(lastApproverClick && lastApproverClick=='allApprover'){
        $scope.switchLabelApprover = 'All'

        $('#requestSwitchOptionsApprover').css("margin-right","11px");
        $('#requestSwitchOptionsApprover').addClass("pull-right");
        $('#requestSwitchOptionsApprover').removeClass("pull-left");

        $('#requestSwitchButtonApprover').addClass("pull-left");
        $('#requestSwitchButtonApprover').removeClass("pull-right");

    }else if(lastApproverClick && lastApproverClick=='myApprover'){
        $scope.switchLabelApprover = 'Mine'
        $('#requestSwitchOptionsApprover').css("margin-right","3px");
        $('#requestSwitchOptionsApprover').addClass("pull-left");
        $('#requestSwitchOptionsApprover').removeClass("pull-right");

        $('#requestSwitchButtonApprover').addClass("pull-right");
        $('#requestSwitchButtonApprover').removeClass("pull-left");

    }

    $scope.requestSwitchApprover = function(){
        if($scope.switchLabelApprover == 'Mine'){
            $scope.switchLabelApprover = 'All'

            $('#requestSwitchOptionsApprover').css("margin-right","11px");
            $('#requestSwitchOptionsApprover').addClass("pull-right");
            $('#requestSwitchOptionsApprover').removeClass("pull-left");

            $('#requestSwitchButtonApprover').addClass("pull-left");
            $('#requestSwitchButtonApprover').removeClass("pull-right");

            $scope.getAllApprovalOrders();
        }else if($scope.switchLabelApprover == 'All'){
            $scope.switchLabelApprover = 'Mine'

            $('#requestSwitchOptionsApprover').css("margin-right","3px");
            $('#requestSwitchOptionsApprover').addClass("pull-left");
            $('#requestSwitchOptionsApprover').removeClass("pull-right");

            $('#requestSwitchButtonApprover').addClass("pull-right");
            $('#requestSwitchButtonApprover').removeClass("pull-left");
            $scope.getMyApprovalOrders();
        }

    }

    $scope.getAllApprovalOrders = function (){
        //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
        $scope.prevApproverFunction = 'allorders';
        $scope.prevStateApprover = '';
        PurchaseRequestUnDraft.allorders({"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
            $scope.approverOrders = data.results;
            $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
            var pending = data.pendingCount==undefined?'0':data.pendingCount;
            var approved = data.approvedCount==undefined?'0':data.approvedCount;
            var rejected = data.rejectedCount==undefined?'0':data.rejectedCount;
            var countAll = {"pending":pending,"approved":approved,"rejected":rejected};
            FilterSummary.prepForBroadcast(countAll);
            $rootScope.lastClickByApprover = 'allApprover';
            //MessageService.publish('updateOrdersSummary');
            orderLength =  $scope.approverOrders.length;
        });
    }
    $scope.getMyApprovalOrders = function (){
        //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
        $scope.prevApproverFunction = 'orders';
        $scope.prevStateApprover = {"approverEmail":$scope.approverEmail};
        PurchaseRequestUnDraft.orders({"approverEmail":$scope.approverEmail,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
            $scope.approverOrders = data.results;
            $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
            var pending = data.pendingCount==undefined?'0':data.pendingCount;
            var approved = data.approvedCount==undefined?'0':data.approvedCount;
            var rejected = data.rejectedCount==undefined?'0':data.rejectedCount;
            var countAll = {"pending":pending,"approved":approved,"rejected":rejected};
            FilterSummary.prepForBroadcast(countAll);
            $rootScope.lastClickByApprover = 'myApprover';
        });
    }

    $scope.$on('purchaseApprovalBoxClickService', function(event) {
        var status1 = PurchaseApprovalBoxClickService.statusParam;
        var status2 = $rootScope.lastClickByApprover;

        if (typeof status2 == 'undefined') {
            if($scope.isApproverAndAdmin){
                //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
                $scope.prevApproverFunction = 'status';
                $scope.prevStateApprover = {"approverEmail":$scope.approverEmail,"status":status1,"lastClick": status2};
                PurchaseRequestUnDraft.status({"approverEmail":$scope.approverEmail,"status":status1,"lastClick": status2,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                    $scope.approverOrders = data.results;
                    $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
//                    FilterSummary.prepForBroadcast(data.pendingCount);
                });
            }else if(!$scope.isAdmin && $scope.isApprover){
                //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
                $scope.prevApproverFunction = 'status';
                $scope.prevStateApprover = {"approverEmail":$scope.approverEmail,"status":status1+"-approverOnly","lastClick": status2};
                PurchaseRequestUnDraft.status({"approverEmail":$scope.approverEmail,"status":status1+"-approverOnly","lastClick": status2,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                    $scope.approverOrders = data.results;
                    $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
                    var pending = data.pendingCount==undefined?'0':data.pendingCount;
                    var approved = data.approvedCount==undefined?'0':data.approvedCount;
                    var rejected = data.rejectedCount==undefined?'0':data.rejectedCount;
                    var countAll = {"pending":pending,"approved":approved,"rejected":rejected};
                    FilterSummary.prepForBroadcast(countAll)
//                    FilterSummary.prepForBroadcast(data.pendingCount);
                });
            }else{
                //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
                $scope.prevApproverFunction = 'status';
                $scope.prevStateApprover = {"approverEmail":null,"status":status1,"lastClick": status2};
                PurchaseRequestUnDraft.status({"approverEmail":null,"status":status1,"lastClick": status2,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                    $scope.approverOrders = data.results;
                    $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
//                    FilterSummary.prepForBroadcast(data.pendingCount);
                });
            }
        }else if(!$scope.isAdmin && $scope.isApprover){
            //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
            $scope.prevApproverFunction = 'status';
            $scope.prevStateApprover = {"approverEmail":$scope.approverEmail,"status":status1+"-approverOnly","lastClick": status2};
            PurchaseRequestUnDraft.status({"approverEmail":$scope.approverEmail,"status":status1+"-approverOnly","lastClick": status2,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                $scope.approverOrders = data.results;
                $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
//                FilterSummary.prepForBroadcast(data.pendingCount);
            });
        }
        else if(!status2 || status2 == 'myApprover'){
            //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
            $scope.prevApproverFunction = 'status';
            $scope.prevStateApprover = {"approverEmail":$scope.approverEmail,"status":status1,"lastClick": status2};
            PurchaseRequestUnDraft.status({"approverEmail":$scope.approverEmail,"status":status1,"lastClick": status2,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                $scope.approverOrders = data.results;
                $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
            });
        }else if(status2 && status2 == 'allApprover'){
            //we need these statuses (prevApproverFunction,prevStateApprover) for pagination (onSelectPage) for approver
            $scope.prevApproverFunction = 'status';
            $scope.prevStateApprover = {"approverEmail":null,"status":status1,"lastClick": status2};
            PurchaseRequestUnDraft.status({"approverEmail":null,"status":status1,"lastClick": status2,"currentPage":$scope.currentPage,"pageSize":$scope.pageSize},function  (data) {
                $scope.approverOrders = data.results;
                $scope.numberOfPagesApprover = data.numberOfPages==undefined ? '0': data.numberOfPages;
            });
        }
    });
    $scope.onSelectPage = function (page){
        var tabSelected = TabService.tabParam;

        if(tabSelected && tabSelected == 'approvalOrders'){
            var prevApproverFunction = $scope.prevApproverFunction;
            var objPrevStateApprover = $scope.prevStateApprover;
            objPrevStateApprover.currentPage = page;
            objPrevStateApprover.pageSize = $scope.pageSize;

            if(prevApproverFunction && prevApproverFunction == 'allorders'){
                PurchaseRequestUnDraft.allorders({"currentPage":page,"pageSize":$scope.pageSize},function  (data) {
                    $scope.approverOrders = data.results;
                });
            }
            else if(prevApproverFunction && prevApproverFunction == 'orders'){
                PurchaseRequestUnDraft.orders(objPrevStateApprover,function  (data) {
                    $scope.approverOrders = data.results;
                });
            }
            else if(prevApproverFunction && prevApproverFunction == 'status'){
                PurchaseRequestUnDraft.status(objPrevStateApprover,function  (data) {
                    $scope.approverOrders = data.results;
                });
            }
            else if(prevApproverFunction && prevApproverFunction == 'approver'){
                PurchaseRequestUnDraft.approver(objPrevStateApprover,function  (data) {
                    $scope.approverOrders = data.results;
                });
            }
        }
    }
}