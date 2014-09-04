function SearchCtrl ($scope, $rootScope , $location,SearchService,SearchServicePO) {

    $scope.search = function() {
        $rootScope.fromPrRequest = false;
        $rootScope.fromPrOrder = false;
        if($scope.currentRequest && $scope.currentPurchaseOrder){
            if($rootScope.fromPRPage){
                SearchService.prepForBroadcast();
                $rootScope.fromPrRequest = true;
                $rootScope.fromPRPage = false;
            }else if($rootScope.fromPOPage){
                SearchServicePO.prepForBroadcast();
                $rootScope.fromPrOrder = true;
                $rootScope.fromPOPage = false;
            }
        }else if($scope.currentRequest){
            SearchService.prepForBroadcast();
            $rootScope.fromPrRequest = true;
        }else if($scope.currentPurchaseOrder){
            SearchServicePO.prepForBroadcast();
            $rootScope.fromPrOrder = true;
        }

        if (angular.isDefined($scope.searchQuery) && $scope.searchQuery != '') {
            $location.path('/search-results/' + $scope.searchQuery);
        };
    }
}

function SearchResultsCtrl ($scope, $routeParams, $rootScope, $filter, Item, Supplier, SupplierByUniqueId, PurchaseOrder,CompanySettings, PurchaseRequest,PurchaseOrderLineItem, LineItem, MessageService,DefaultCostCenter,CostCenters, BuyerGroupByCategoryAndSupplier) {
    $scope.sort = "Price Ascending";
    $scope.sortBy = "PRICE_ASC";
    $scope.recordsPerPage = 10;
    $scope.pageNo = 1;
    $scope.currentRequest = $rootScope.currentRequest;
    $scope.currentPurchaseOrder = $rootScope.currentPurchaseOrder;
    $scope.lineItem          = {supplierName:' '};
    $scope.searchingItems = true;
    $scope.noSearchResultFound = false;
    $scope.searchKeyword = $routeParams.keyword;
    $scope.fromPrRequest = $rootScope.fromPrRequest;
    $scope.fromPrOrder = $rootScope.fromPrOrder;
    $scope.rolesWithBuyer = $rootScope.rolesWithBuyer;
    $scope.adminOnly = $rootScope.adminOnly;
    $scope.approverOnly = $rootScope.approverOnly;
    $scope.buyerOnly = $rootScope.buyerOnly;
    $scope.buyerApprover = $rootScope.buyerApprover;
    $scope.employeeOnly = $rootScope.employeeOnly;
    $scope.rolesWithoutBuyer = $rootScope.rolesWithoutBuyer;
//    $scope.fromPrRequest = false;
//    $scope.fromPrOrder = false;

    var requestId = $rootScope.currentRequest&&$rootScope.currentRequest.id;
    var orderId = $rootScope.currentPurchaseOrder&&$rootScope.currentPurchaseOrder.id;

    if(requestId != null){
        $scope.lineItems  = LineItem.query({requestId: requestId},function(data){
            nextItemNumber();
        });
    }else{
        nextItemNumber();
    }

    if(orderId != null){
        $scope.purchaseOrderlineItems  = PurchaseOrderLineItem.query({orderId: orderId},function(data){
            nextItemNumberForPO();
        });
    }else{
        nextItemNumberForPO();
    }

    $scope.fetchResults = function() {
            $scope.results = Item.query({
                keyword: $routeParams.keyword,
                recordsPerPage: $scope.recordsPerPage,
                sortBy: $scope.sortBy,
                pageNo: $scope.pageNo
            },function(data){
                if(data.items){
                    $scope.searchingItems = false;
                }else   if(data.hits.total == 0 && data.hits){
                            $scope.searchingItems = false;
                            $scope.noSearchResultFound = true;
                        }
            });
    }
    $scope.fetchResults();
    $scope.companySettings = CompanySettings.query();
    $scope.costCenters = CostCenters.query(function() {
        populateDefaultItemAccountingData();
    });
    function populateDefaultItemAccountingData(){
        var costCenterId =DefaultCostCenter.get(function() {
            $scope.costCenters.forEach(function(costCenter) {
                if(costCenter.id == costCenterId.id) {
                    $rootScope.defaultAccountingInfo = {costCenter:costCenter.code};
                }
            });
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

    $scope.$watch('pageNo', function(newValue, oldValue) {
        if (newValue && newValue != oldValue) {
            $scope.fetchResults();
        };
    });

    $scope.$watch('recordsPerPage', function(newValue, oldValue) {
        if (newValue && newValue != oldValue) {
            $scope.fetchResults();
        };
    });

    $scope.$watch('sortBy', function(newValue, oldValue) {
        if (newValue && newValue != oldValue) {
            switch(newValue) {
                case "PRICE_DESC":
                    $scope.sort = "Price Descending";
                    break;
                case "PRICE_ASC":
                    $scope.sort = "Price Ascending";
                    break;
                case "RELEVANCY":
                    $scope.sort = "Relevancy";
                    break;
            };
            $scope.fetchResults();
        };
    });
    var buyerGroupIdForItem;
    var itemSupplierId;
    $scope.addToOrder = function(item, newRequest){
        if(item.supplierId){
            SupplierByUniqueId.query({id:item.supplierId},function(data){
                if(data.length > 0){
                    if(data[0].buyRoute){
                        $scope.buyRoute = true;
                    }else{
                        $scope.buyRoute = false;
                    }
                }
                if(data.length == 0 || data == [] || data == null){
                    Supplier.find({id:item.supplierId},function(data){
                        if(data != null && data){
                            if(data.buyRoute){
                                $scope.buyRoute = true;
                            }else{
                                $scope.buyRoute = false;
                            }
                        }
                        if(data.length == 0 || data == [] || data == null){
                            buyerGroupIdForItem = $scope.companySettings.defaultBuyerGroupId;
                            $scope.addToOrderNext(item, newRequest, buyerGroupIdForItem);
                        }else{
                            itemSupplierId = data.companyId;
                            if(itemSupplierId && item.materialGroup){
                                BuyerGroupByCategoryAndSupplier.query({categoryCode:item.materialGroup, supplier: itemSupplierId}, function(result){
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
                    });
                    }else{
                    itemSupplierId = data[0].companyId;
                    if(itemSupplierId && item.materialGroup){
                        BuyerGroupByCategoryAndSupplier.query({categoryCode:item.materialGroup, supplier: itemSupplierId}, function(result){
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
            });
        }else{
            buyerGroupIdForItem = $scope.companySettings.defaultBuyerGroupId;
            $scope.addToOrderNext(item, newRequest, buyerGroupIdForItem);
        }
    }
    $scope.addToOrderNext = function(item, newRequest, buyerGroupIdForItem) {
        var formatOrder = $filter('formatOrder');

        if (item.quantity < item.minOrderQty) {
            item.quantity = item.minOrderQty;
        };

        var lineItem = {
            id:$scope.lineItem.id,
            category: item.materialGroup,
            qty: item.quantity,
            description: item.title,
            notes: item.description,
            unitPrice: item.unitPrice,
            uom: item.unit,
            type: item.service?'service':'product',
            partNo: item.vendorMat,
            manufacturerPartNo: item.manufactMat,
            currency: item.currencyCode,
            accountingInfo: $rootScope.defaultAccountingInfo,
            supplierName:item.supplierName&&item.supplierName||'',
            manufacturerName:item.manufacturerName,
            brandName:item.brandName,
            deliveryDate: new Date(),
            supplierId:itemSupplierId,
            supplierUniqueId:item.supplierId,
            buyerGroupId:buyerGroupIdForItem,
            buyRoute:$scope.buyRoute
        };

        if (angular.isDefined($rootScope.currentRequest)) {
            lineItem.requestId = $rootScope.currentRequest.id;
            LineItem.create(lineItem, function() {
                $rootScope.currentRequest.items.push(lineItem);
                $scope.lineItems  = LineItem.query({requestId: $rootScope.currentRequest.id},function(data){
                    nextItemNumber();
                });

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
                    $scope.lineItems  = LineItem.query({requestId: $rootScope.currentRequest.id},function(data){
                        nextItemNumber();
                    });

                    if(request && (request.name == null || request.name == '' || request.name == undefined)){
                        var orderNumber = formatOrder(request.orderNumber);

                        request.name = request.requester + ' ' + orderNumber;
                        PurchaseRequest.save(request);
                    }
                    noty({text: lineItem.description + " has been added to order " + formatOrder(purchaseRequest.orderNumber), type: "warning"});
                });
            });
        };
    }

    $scope.addToPurchaseOrder = function(item, newOrder) {
        var formatOrder = $filter('formatOrder');

        if (item.quantity < item.minOrderQty) {
            item.quantity = item.minOrderQty;
        };
//        alert(item.supplierId);
        var lineItem = {
            id:$scope.lineItem.id,
            category: item.materialGroup,
            qty: item.quantity,
            description: item.title,
            notes: item.description,
            unitPrice: item.unitPrice,
            uom: item.unit,
            type: item.service?'service':'product',
            partNo: item.vendorMat,
            manufacturerPartNo: item.manufactMat,
            currency: item.currencyCode,
            accountingInfo: $rootScope.defaultAccountingInfo,
            supplierName:item.supplierName&&item.supplierName||' ',
            manufacturerName:item.manufacturerName,
            brandName:item.brandName,
            deliveryDate: new Date()
        };

        if (angular.isDefined($rootScope.currentPurchaseOrder)) {
            if (angular.isDefined(item.supplierId) && item.supplierId) {
                SupplierByUniqueId.query({id:item.supplierId}, function(data){
                      if (null != $rootScope.currentPurchaseOrder.vendor && data[0].companyId != $rootScope.currentPurchaseOrder.vendor) {
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
                        purchaseOrder.vendor = data.length > 0 ? data[0].companyId:'';
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

//    $scope.addToPurchaseOrder = function(item, newOrder) {
//        alert('called');
//        var formatOrder = $filter('formatOrder');
//        var reset = false;
//        if(item.quantity == undefined) {
//            reset = true;
//            item.quantity = 1;
//        }
//
//        if (item.quantity < item.minOrderQty) {
//            item.quantity = item.minOrderQty;
//        };
//
//
//        var lineItem = {
//            id:$scope.lineItem.id,
//            category: item.productCategory,
//            qty: item.quantity,
//            description: item.shortDescription,
//            notes: item.longDescription,
//            unitPrice: item.price,
//            uom: item.uom,
//            type: 'product',
//            partNo: item.vendorMat,
//            manufacturePartNo: item.mpn,
//            currency: item.currency,
//            accountingInfo: $rootScope.defaultAccountingInfo,
//            supplierName:item.supplierName&&item.supplierName||' ',
//            manufacturerName:item.manufacturerName,
//            brandName:item.brandName,
//            deliveryDate: new Date()
//        };
//        if(reset){
//            item.quantity = undefined;
//        }
//
//
//        if (!newOrder && angular.isDefined($rootScope.currentPurchaseOrder)) {
//            lineItem.orderId = $rootScope.currentPurchaseOrder.id;
//            PurchaseOrderLineItem.create(lineItem, function() {
//                $rootScope.currentPurchaseOrder.items.push(lineItem);
//                noty({text: lineItem.description + " has been added to order " + formatOrder($rootScope.currentPurchaseOrder.orderNumber), type: "warning"});
//            });
//        } else {
//            var purchaseOrder = PurchaseOrder.create(function(){
//                MessageService.publish('updateOrdersSummary');
//                lineItem.orderId = purchaseOrder.id;
//                lineItem.id=1;
//                PurchaseOrderLineItem.create(lineItem, function() {
//                    purchaseOrder.items.push(lineItem);
//                    $rootScope.currentPurchaseOrder = purchaseOrder;
//                    noty({text: lineItem.description + " has been added to order " + formatOrder($rootScope.currentPurchaseOrder.orderNumber), type: "warning"});
//                });
//            });
//        };
//    }

    $scope.addToFavorite = function(item) {
        noty({text: "This is a future feature.", type: "warning"});
    }
}