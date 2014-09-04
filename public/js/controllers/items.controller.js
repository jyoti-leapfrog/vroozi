function ItemsCtrl ($scope, $routeParams, $rootScope, $filter, Item, LineItem, PurchaseRequest, MessageService,CostCenters,DefaultCostCenter,Currencies,DefaultCurrency,PurchaseOrderLineItem,PurchaseOrder,SupplierByUniqueId, BuyerGroupByCategoryAndSupplier, CompanySettings) {

    //get values from rootscope abt the logged in user.
    $scope.fromPrRequest = $rootScope.fromPrRequest;
    $scope.fromPrOrder = $rootScope.fromPrOrder;
    $scope.rolesWithBuyer = $rootScope.rolesWithBuyer;
    $scope.adminOnly = $rootScope.adminOnly;
    $scope.approverOnly = $rootScope.approverOnly;
    $scope.buyerOnly = $rootScope.buyerOnly;
    $scope.employeeOnly = $rootScope.employeeOnly;
    $scope.rolesWithoutBuyer = $rootScope.rolesWithoutBuyer;

    $scope.item = Item.get({ id: $routeParams.id },function(data){
        if(typeof data.service == undefined || data.service == null || data.service == ""){
            $scope.type = "Product";
        }else{
            $scope.type = "Service"
        }
        $scope.productCategory = data.productCategory;
        SupplierByUniqueId.query({ id:data.vendorId},function(res){
            if(res[0].buyRoute){
                $scope.buyRoute = true;
            }else{
                $scope.buyRoute = false;
            }
            $scope.supplierId = res[0].companyId;
            $scope.defaultVendorId = res[0].defaultVendorId;
            $scope.item.supplierLogo = "/supplier/" + res[0].logo.split('/').slice(1,2);
        });

    });
    $scope.companySettings = CompanySettings.query();
    $scope.currentRequest = $rootScope.currentRequest;
    $scope.lineItem          = {supplierName:' '};

    var requestId = $rootScope.currentRequest&&$rootScope.currentRequest.id;
    var orderId = $rootScope.currentPurchaseOrder&&$rootScope.currentPurchaseOrder.id;

    $scope.lineItems  = LineItem.query({requestId: requestId},function(data){
        nextItemNumber();
    });
    $scope.purchaseOrderlineItems  = PurchaseOrderLineItem.query({orderId: orderId},function(data){
        nextItemNumberForPO();
    });

    if (angular.isDefined($rootScope.currentRequest)) {
        $scope.lineItems  = LineItem.query({requestId: $rootScope.currentRequest.id},function(data){
            nextItemNumber();
        });
    }

    function nextItemNumber() {
        var maxItemNumber = 1;
        if(typeof $scope.lineItems === 'undefined' || $scope.lineItems.length===0){
            $scope.lineItem.id = maxItemNumber;
        }else{
            $scope.lineItems.forEach(function(lineItem) {
                if(lineItem.id>maxItemNumber){
                    maxItemNumber = lineItem.id;
                }
                if(typeof lineItem.categoryName == 'undefined' || lineItem.categoryName == null || lineItem.categoryName == ''){
                    lineItem.categoryName = "Other";
                }
            });
            $scope.lineItem.id = parseInt(maxItemNumber)+1;
        }
    }

    $scope.addToPurchaseOrder = function(item, newOrder) {
        var formatOrder = $filter('formatOrder');
        if(item.quantity == undefined || item.quantity == null || item.quantity == 0){
            item.quantity = 1;
        }
        if (item.quantity < item.minOrderQty) {
            item.quantity = item.minOrderQty;
        };
//        alert(item.supplierId);
        var lineItem = {
            id:$scope.lineItem.id,
            category: item.productCategory,
            qty: item.quantity,
            description: item.shortDescription,
            notes: item.longDescription,
            unitPrice: item.price,
            uom: item.uom,
            type: item.service?'service':'product',
            partNo: item.vendorMat,
            manufacturerPartNo: item.mpn,
            currency: item.currency,
            accountingInfo: $rootScope.defaultAccountingInfo,
            supplierName:item.supplierName&&item.supplierName||' ',
            manufacturerName:item.manufacturerName,
            brandName:item.brandName,
            deliveryDate: new Date()
        };

        if (angular.isDefined($rootScope.currentPurchaseOrder)) {
            if (angular.isDefined(item.supplierId) && item.supplierId) {
                SupplierByUniqueId.query({id:item.supplierId}, function(data){
                    if (data[0].companyId != $rootScope.currentPurchaseOrder.vendor) {
                        var purchaseOrder = PurchaseOrder.create(function(order){
                            MessageService.publish('updateOrdersSummary');
                            purchaseOrder.vendor = data[0].companyId;
                            purchaseOrder.supplierName = item.supplierName;
                            PurchaseOrder.save(purchaseOrder, function(){
                                lineItem.orderId = purchaseOrder.id;
                                lineItem.id=1;
                                PurchaseOrderLineItem.create(lineItem, function() {
                                    purchaseOrder.items.push(lineItem);
                                    $scope.purchaseOrderlineItems  = PurchaseOrderLineItem.query({orderId: $rootScope.currentPurchaseOrder.id},function(data){
                                        nextItemNumberForPO();
                                    });
                                    $rootScope.currentPurchaseOrder = purchaseOrder;
                                    noty({text: lineItem.description + " has been added to order " + formatOrder($rootScope.currentPurchaseOrder.orderNumber), type: "warning"});
                                });
                            }) ;
                            setOrderName(order);
                        });
                    } else {
                        lineItem.orderId = $rootScope.currentPurchaseOrder.id;
                        PurchaseOrderLineItem.create(lineItem, function() {
                            $rootScope.currentPurchaseOrder.items.push(lineItem);
                            $scope.purchaseOrderlineItems  = PurchaseOrderLineItem.query({orderId: $rootScope.currentPurchaseOrder.id},function(data){
                                nextItemNumberForPO();
                            });
                            noty({text: lineItem.description + " has been added to order " + formatOrder($rootScope.currentPurchaseOrder.orderNumber), type: "warning"});
                        });
                    }
                });
            } else {
                lineItem.orderId = $rootScope.currentPurchaseOrder.id;
                PurchaseOrderLineItem.create(lineItem, function() {
                    $rootScope.currentPurchaseOrder.items.push(lineItem);
                    $scope.purchaseOrderlineItems  = PurchaseOrderLineItem.query({orderId: $rootScope.currentPurchaseOrder.id},function(data){
                        nextItemNumberForPO();
                    });
                    noty({text: lineItem.description + " has been added to order " + formatOrder($rootScope.currentPurchaseOrder.orderNumber), type: "warning"});
                });
            }
        } else {
            if (angular.isDefined(item.supplierId) && item.supplierId) {
                SupplierByUniqueId.query({id:item.supplierId}, function(data){
//                 alert('company Id: ' + data[0].companyId);
                    var purchaseOrder = PurchaseOrder.create(function(order){
                        MessageService.publish('updateOrdersSummary');
                        purchaseOrder.vendor = data[0].companyId;
                        purchaseOrder.supplierName = item.supplierName;
                        PurchaseOrder.save(purchaseOrder, function(){
                            lineItem.orderId = purchaseOrder.id;
                            lineItem.id=1;
                            PurchaseOrderLineItem.create(lineItem, function() {
                                purchaseOrder.items.push(lineItem);
                                $rootScope.currentPurchaseOrder = purchaseOrder;
                                noty({text: lineItem.description + " has been added to order " + formatOrder($rootScope.currentPurchaseOrder.orderNumber), type: "warning"});
                            });
                        }) ;
                        setOrderName(order);
                    });
                }, function(err) {
//                alert(err);
                });
            } else {
                var purchaseOrder = PurchaseOrder.create(function(order){
                    MessageService.publish('updateOrdersSummary');
                    lineItem.orderId = purchaseOrder.id;
                    lineItem.id=1;
                    PurchaseOrderLineItem.create(lineItem, function() {
                        purchaseOrder.items.push(lineItem);
                        $rootScope.currentPurchaseOrder = purchaseOrder;
                        noty({text: lineItem.description + " has been added to order " + formatOrder($rootScope.currentPurchaseOrder.orderNumber), type: "warning"});
                    });
                    setOrderName(order);
                });
            }

        };
    }

    function setOrderName(order){
        var formatOrder = $filter('formatOrder');
        if(order && (order.name == null || order.name == '' || order.name == undefined)){
            var orderNumber = formatOrder(order.orderNumber);

            order.orderName = order.requester + ' ' + orderNumber;
            PurchaseOrder.save(order);
        }
    }
    var buyerGroupIdForItem;
    $scope.addToOrder = function(item, newRequest){
        if($scope.supplierId && $scope.productCategory){
            BuyerGroupByCategoryAndSupplier.query({categoryCode:$scope.productCategory, supplier: $scope.supplierId}, function(result){
                if(result == null || result == [] || result.length == 0){
                    buyerGroupIdForItem = $scope.companySettings.defaultBuyerGroupId;
                    $scope.addToOrderNext(item, newRequest, buyerGroupIdForItem);
                }else{
                    buyerGroupIdForItem = result[0].id;
                    $scope.addToOrderNext(item, newRequest, buyerGroupIdForItem)
                }
            });
        }else{
            buyerGroupIdForItem = $scope.companySettings.defaultBuyerGroupId;
            $scope.addToOrderNext(item, newRequest, buyerGroupIdForItem);
        }
    }
    $scope.addToOrderNext= function(item, newRequest, buyerGroupIdForItem) {
        var formatOrder = $filter('formatOrder');
        var reset = false;
        if(item.quantity == undefined) {
            reset = true;
            item.quantity = 1;
        }

        if (item.quantity < item.minOrderQty) {
            item.quantity = item.minOrderQty;
        };


        var lineItem = {
            id:$scope.lineItem.id,
            category: item.productCategory,
            qty: item.quantity,
            description: item.shortDescription,
            notes: item.longDescription,
            unitPrice: item.price,
            uom: item.uom,
            type: item.service?'service':'product',
            partNo: item.vendorMat,
            manufacturerPartNo: item.mpn,
            currency: item.currency,
            accountingInfo: $rootScope.defaultAccountingInfo,
            supplierName:item.supplierName&&item.supplierName||'',
            manufacturerName:item.manufacturerName,
            brandName:item.brandName,
            deliveryDate: new Date(),
            supplierId:$scope.supplierId,
            supplierUniqueId:item.supplierId,
            buyerGroupId:buyerGroupIdForItem,
            buyRoute:$scope.buyRoute
        };
            if(reset){
                item.quantity = undefined;
            }


        if (angular.isDefined($rootScope.currentRequest)) {
            lineItem.requestId = $rootScope.currentRequest.id;
            LineItem.create(lineItem, function() {
                $rootScope.currentRequest.items.push(lineItem);
                noty({text: lineItem.description + " has been added to order " + formatOrder($rootScope.currentRequest.orderNumber), type: "warning"});
            });
        } else {
            var purchaseRequest = PurchaseRequest.create(function(request){
                MessageService.publish('updateOrdersSummary');
                lineItem.requestId = purchaseRequest.id;
                lineItem.id=1;
                LineItem.create(lineItem, function() {
                    purchaseRequest.items.push(lineItem);
                    $rootScope.currentRequest = purchaseRequest;

                    if(request && (request.name == null || request.name == '' || request.name == undefined)){
                        var orderNumber = formatOrder(request.orderNumber);

                        request.name = request.requester + ' ' + orderNumber;
                        PurchaseRequest.save(request);
                    }
                    noty({text: lineItem.description + " has been added to order " + formatOrder($rootScope.currentRequest.orderNumber), type: "warning"});
                });
            });
        };
    }

    function nextItemNumberForPO() {
        var maxItemNumber = 1;
        if(typeof $scope.purchaseOrderlineItems === 'undefined' || $scope.purchaseOrderlineItems.length===0){
            $scope.lineItem.id = maxItemNumber;
        }else{
            $scope.purchaseOrderlineItems.forEach(function(lineItem) {
                if(lineItem.id>maxItemNumber){
                    maxItemNumber = lineItem.id;
                }
            });
            $scope.lineItem.id = parseInt(maxItemNumber)+1;
        }
    }
    $scope.addToFavorite = function(item) {
        noty({text: "This is a future feature.", type: "warning"});
    }

    $scope.backToSearch = function() {
        window.history.back();
    }
}