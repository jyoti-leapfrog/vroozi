'use strict';

function QuickRfxCtrl ($routeParams, $rootScope, $scope, $location, $http, $controller, QuickRfx, QuickRfxs, Suppliers, LineItems, Categories, Currencies,
                       DefaultCurrency, Uoms) {

    $scope.quoteResponsePosition = -1;

    $scope.toggleQuotation = function(index) {
        
        $scope.quoteResponsePosition = $scope.quoteResponsePosition == index ? -1 : index;
    }

    $scope.suppliers = [];
    $scope.suppliers = Suppliers.query(function(supdata) {});
    $scope.labelLineItem = "Add Line Item";
    $scope.saveButtonLabel = "Save";
    $scope.forQuickRfx = false;
    $scope.selectedSuppliers = [];

    $scope.addSupplierToList = function() {
        if ($scope.selectedSupplier != undefined) {
            $scope.selectedSuppliers.push($scope.selectedSupplier);
        }
    }

    $scope.addNewSupplierToList = function(companyName, contactName, email){        
        $scope.pushdata = {
            'companyName': companyName,
            'contactName': contactName,
            'email': email
        }
        $scope.selectedSuppliers.push($scope.pushdata);
    }

    $scope.quotationrequest = {};
    $scope.quotationRequestNumberFormatted = "";
    $scope.quotationrequest.quotationRequestId = null;
    $scope.quotationrequest.quotationRequestNumber = null;

    $scope.quotationrequest.buyerName = "";
    $scope.buyerGroupName = "";

    $scope.quotationrequest.multipleResponsesPerSupplier = false;
    $scope.quotationrequest.deadline = "";
    $scope.quotationrequest.effectiveDate = new Date();
    $scope.quotationrequest.createdDate = new Date();

    $scope.quotationrequest.specialInstructions = "";
    $scope.quotationrequest.contactName = "";
    $scope.quotationrequest.country = "usa";
    $scope.quotationrequest.email = "fried.dust@gmail.com";
    $scope.quotationrequest.address = "us";
    $scope.quotationrequest.phoneNumber = "2222222222";



    $scope.buyers = "";

    $scope.$watch("quotationrequest.quotationRequestNumber", function() {
        if($scope.quotationrequest.quotationRequestNumber){
            var x = $scope.quotationrequest.quotationRequestNumber;
            var y = x.substring(0,4) + '-' + x.substring(4,8) + '-' + x.substring(8,12);
            $scope.quotationRequestNumberFormatted = y;
        }
    });

    $scope.$on('$routeChangeSuccess', function() { 

            if($routeParams.quotationRequestId){
                //alert($routeParams.quotationRequestId);
                var quotationRequestId = $routeParams.quotationRequestId;
                $http({method: 'GET', url: 'api/quotation-request/' + quotationRequestId})
                    .success(function(data, status, headers,config) {
                            //console.log(JSON.stringify(data));
                        $scope.quotationrequest = data;
                        $scope.quotationRequestNumberFormatted = data.quotationRequestNumber;
                        if (data.deadline != null && data.deadline != "") {
                            $scope.quotationrequest.deadline = new Date(moment(data.deadline*1000));
                        }
                        if (data.effectiveDate != null && data.effectiveDate != "") {
                            $scope.quotationrequest.effectiveDate = new Date(moment(data.effectiveDate*1000));
                        }
                        if (data.createdDate != null && data.createdDate != "") {
                            $scope.quotationrequest.createdDate = new Date(moment(data.createdDate*1000));
                        }

                        $scope.fixBuyerGroup($scope.quotationrequest.items[0].buyerGroupId);
                        $scope.fixBuyer();
                        
                        for (var i=0; i < $scope.quotationrequest.items.length; i++) {
                            var item = $scope.quotationrequest.items[i];
                            var supplierId = item.supplierId;
                            
                            $scope.selectedSuppliers.push({
                                companyId:$scope.quotationrequest.items[0].supplierId
                            });

                            Suppliers.get({id:supplierId}, function(supdata) {
                                //console.log(d);
                                var s = $scope.selectedSuppliers[0];
                                s.companyName = supdata.companyName;
                                s.contactName = supdata.contactName;
                                s.email = supdata.email;
                                s.address1 = supdata.address1;
                                s.phone = supdata.phone;

                                
                            });
                        }
                        
                    }).error (function (data, status, headers,config){
                });
            } else {
                $scope.quotationrequest.deadline = "";
                $scope.quotationrequest.items = LineItems.getItems();

                $scope.selectedSuppliers.push({
                    companyId:$scope.quotationrequest.items[0].supplierId
                });

                Suppliers.get({id:$scope.quotationrequest.items[0].supplierId}, function(supdata) {
                    var item = $scope.selectedSuppliers[0];

                    item.companyName = supdata.companyName;
                    item.email = supdata.email;
                    item.address1 = supdata.address1;
                    item.phone = supdata.phone;

                    var existing = $scope.findSupplier($scope.selectedSuppliers, supdata);
                    if (existing) {
                        existing.companyName = supdata.companyName;
                        existing.contactName = supdata.contactName;
                        existing.email = supdata.email;
                        existing.address1 = supdata.address1;
                        existing.phone = supdata.phone;
                    }
                });

                $scope.fixBuyerGroup($scope.quotationrequest.items[0].buyerGroupId);     
                $scope.fixBuyer();
                
                $scope.newQuickRfxOrder(false);
            }
            
        });

    $scope.fixBuyerGroup = function(buyerGroupId) {
        $http({method: 'GET', url: 'api/buyer-groups/' + buyerGroupId})
        .success(function(data, status, headers,config) {
            var buyerGroup = data;

            $scope.buyerGroupName = data.groupName;
        });
    }

    $scope.fixBuyer = function() {
        $http({method: 'GET', url: 'api/profile'})
        .success(function(data, status, headers,config) {
            $scope.quotationrequest.buyerName = data.firstName + " " + data.lastName;
        });
    }

    $scope.findSupplier = function(suplist, supdata) {
        for (var i =0; i<suplist.length; i++) {
            var temp = suplist[i];

            if (temp.companyId == supdata.companyId) {
                return temp;
            }
        }
        return undefined;
    }

    $scope.newQuickRfxOrder = function(fromForm){
        if(!$scope.multipleResponsesPerSupplier){
            $scope.multipleResponsesPerSupplier = false;
        }
        var supplierIds = [];

        for (var i=0; i < $scope.selectedSuppliers.length; i++){            
            var temp = $scope.selectedSuppliers[i];
            if (temp.companyId == undefined) {
                console.log('undefined');
            }
            if (temp.companyId != undefined) {
                supplierIds.push(temp.companyId);    
            }            
        }
        
        var suppliersCommaSeparated = supplierIds.join(",");
        $scope.quotationrequest.suppliers = supplierIds;

        var postdata = angular.toJson($scope.quotationrequest);

        $http({method: 'POST', data:postdata, url: 'api/quotation-request/' + suppliersCommaSeparated})
            .success(function(data, status, headers,config) {
                $scope.quotationrequest.quotationRequestId = data.quotationRequestId;
                $scope.quotationrequest.quotationRequestNumber = data.quotationRequestNumber;
                $scope.quotationRequestNumberFormatted = data.quotationRequestNumber;
                console.log(JSON.stringify(data));
                if (fromForm) {
                    $location.path("/");
                    noty({text: "Your form has been saved.", type: "warning"});
                }
            }). error (function (data, status, headers,config){
        });
        // QuickRfx.create(quotationrequest, {suppliers : supplierIds[0]}, function (response) {
        //     console.log('response', response);
        // });
    };

    $scope.categories = Categories.list(function (data){
//        for(var catIndex in data) {
//            $scope.catMap[data[catIndex].unspscCode] = data[catIndex].unspscCategory;
//            $scope.revCatMap[data[catIndex].unspscCategory] = data[catIndex].unspscCode;
//        }
    });

    $scope.currencies = Currencies.list(function (data) {
        populateDefaultItemCurrencyData();
    });

    function populateDefaultItemCurrencyData() {
        var currencyCode = DefaultCurrency.get(function () {
            if (angular.isUndefined(currencyCode)) {
                currencyCode = 'USD';
            }
            $scope.currencies.forEach(function (currency) {
                if (currency.code == currencyCode.code) {
                    $rootScope.defaultCurrencyCode = currencyCode.code;
                    $scope.lineItem.currency = currency.code;
                }
            });
        });
    }

    $scope.uoms = Uoms.list('', function (data) {
        $scope.uoms = data;
    });


    //use this functionality as to reset the fields of Line Item Modal when you save the line Item or Close the Line Item
    function resetItem() {
        $scope.lineItem = {supplierName: ' '};
        $scope.lineItem.type = 'product';
        $scope.labelLineItem = 'Create Line Item';
        $scope.lineItem.qty = 1;
        $scope.lineItem.deliveryDate = new Date();
        if(typeof $scope.purchaseRequest != 'undefined' && $scope.purchaseRequest){
            if(typeof $scope.purchaseRequest.shipAddresses != 'undefined' && $scope.purchaseRequest.shipAddresses)
            {
                $scope.lineItem.shippingAddress = $scope.purchaseRequest.shipAddresses;
            }
        }
        $scope.tempData.availableSupplier=true;
        $scope.tempData.recommendedSupplier=true;
        $("#deliveryDate").val('');
        $("#validityFrom").val('');
        $("#validityTo").val('');
        populateDefaultItemAccountingData();
        populateDefaultItemCurrencyData();
        nextItemNumber();
    }

    $scope.saveLineItem = function(desc, supp, qty, uom, category, part, price)   {           
        if ($scope.li == undefined) {
            $scope.li = [];
        }        
            $scope.pushdata = {
                'description' : desc,
                'supplierName' : supp,                
                'qty' : qty,
                'uom' : uom,
                'categoryName' : category,
                'partNo' : part,
                'unitPrice' : price
            }
            $scope.li.push($scope.pushdata);                
            $('.modal').modal('hide');            
    };

    $scope.goBack = function () {
        $location.path("/overview");
    };

}