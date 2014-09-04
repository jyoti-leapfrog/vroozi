'use strict';

function PurchaseOrdersCtrl ($routeParams, $rootScope, $scope, PurchaseOrder,PurchaseOrders, $location,
                             Address, CompanySettings, Suppliers, CountriesList, PaymentTerms, Users,
                             DefaultCurrency,Categories, Uoms, Currencies,DefaultCostCenter,
                             CostCenters,PurchaseOrderLineItem, CompanyCodes, GLAccounts,MessageService) {


    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.itemsCount = 0;
    $scope.editable = true;
    $scope.lineItem = {supplierName: ' '};
    $scope.idOrder = $routeParams.id;
    $scope.supplier = {};
    $scope.showSupplierFields = false;
    $scope.tempData = {};
    $scope.disablePOforEmployee = false;
    $scope.changeHeading = false;
    $scope.isReadOnlyPO = false;
    $rootScope.fromPRPage = false;
    $rootScope.fromPOPage = true;
    var flag = false;

    $scope.catMap = new Object();
    $scope.revCatMap = new Object();

    function getCatDesc(k) {
        return $scope.catMap[k];
    }

    function getCatCode(k) {
        return $scope.revCatMap[k];
    }


    PurchaseOrders.get({id: $routeParams.id}, function (data) {
        $scope.purchaseOrder = data;
        $scope.purchaseOrderVendorAvailable = $scope.purchaseOrder.vendor;
        var items = $scope.purchaseOrder.items;
        calculateOrderTotalAmounts(items);
        var reportsOrderUrl = '/api/pdfOrderreports/'+ $scope.purchaseOrder.id + '?status=approved';
        $scope.pdfOrderReportsUrl = reportsOrderUrl;

        if ($scope.purchaseOrder.status == 'APPROVED'){
            $scope.showPrintButton = true;
        }else{
            $scope.showPrintButton = false;
        }

        Users.get({id:$scope.purchaseOrder.userId}, function(user){
            if($scope.purchaseOrder.companyAddress == null || typeof $scope.purchaseOrder.companyAddress === 'undefined'){
                $scope.addresses = Address.query(function () {
                    $scope.addresses.forEach(function (address) {
                        if (user.addresses.company ==  address.id) {
                            $scope.purchaseOrder.companyAddress = address;
                        }
                    });
                });
            }
            user.rolesPerApp.purchaseManagerRoles.forEach(function (role) {
                if(role == 'Admin'){
                    $scope.userAsAdmin = true;

                }else if(role == 'Employee'){
                    $scope.userAsEmployee = true;

                }else if(role == 'Approver'){
                    $scope.userAsApprover = true;

                }else if(role == 'Buyer'){
                    $scope.userAsBuyer = true;
                }
            });
            if($scope.userAsEmployee || $scope.userAsAdmin || $scope.userAsApprover){
                $scope.disablePOforEmployee = true;
                $scope.changeHeading = true;
            }
            if($scope.userAsBuyer){
                $scope.disablePOforEmployee = false;
                $scope.changeHeading = false;
            }
//            $scope.purchaseOrder.buyerContact= user.username;
        });
//        alert($scope.purchaseOrder.orderType);
        if (!angular.isDefined($scope.purchaseOrder.orderType) || $scope.purchaseOrder.orderType == null){
            $scope.purchaseOrder.orderType = 'standard';
        }
        if (!angular.isDefined($scope.purchaseOrder.buyer) || $scope.purchaseOrder.buyer == null){
            $scope.purchaseOrder.buyer = $scope.purchaseOrder.requester;
        }

        if (!angular.isDefined($scope.purchaseOrder.purchasingOrganization) || $scope.purchaseOrder.purchasingOrganization == null){
            $scope.purchaseOrder.purchasingOrganization = 'North America';
        }

        if (!angular.isDefined($scope.purchaseOrder.purchasingGroup) || $scope.purchaseOrder.purchasingGroup == null){
            $scope.purchaseOrder.purchasingGroup = 'North America East Coast';
        }


        if (!angular.isDefined($scope.purchaseOrder.buyer) || $scope.purchaseOrder.buyer == null){
            $scope.purchaseOrder.buyer = $scope.purchaseOrder.requester;
        }

        if (!angular.isDefined($scope.purchaseOrder.buyerContact) || $scope.purchaseOrder.buyerContact == null){
            Users.get({id:$scope.purchaseOrder.userId}, function(user){
                $scope.purchaseOrder.buyerContact= user.username;
            });
        }

        $rootScope.currentPurchaseOrder = data;
        $scope.purchaseOrderNumber = $scope.purchaseOrder.orderNumber;
//        $scope.requestOrder = '3'+$scope.purchaseOrderNumber.substring(1,$scope.purchaseOrderNumber.length);
//        Profiles.query(function (data) {
//            $scope.showApproveButtons = isApproveButtonsDisplay($scope.purchaseRequest, data.userId);
//            $scope.showRejectedMessage = isRejectedMessageDisplay($scope.purchaseRequest, data.userId);
//
//        });

//        $scope.isReadOnlyRequest = isReadOnly($scope.purchaseOrder);

        $scope.goBackOrder = false;
        if ($scope.purchaseOrder.status == 'PENDING') {
            $scope.goBackOrder = true;
        }
        if ($scope.purchaseOrder.status == 'NEW') {
            $scope.labelPurchaseOrderText = "Create Purchase Order";
            $scope.goBackOrder = true;

        } else if ($scope.purchaseOrder.status == 'DRAFT') {
            $scope.labelPurchaseOrderText = "Edit Purchase Order";
            $scope.goBackOrder = true;

        } else if ($scope.purchaseOrder.status == 'APPROVED' || $scope.purchaseOrder.status == 'SENT') {
            $scope.reasonForReject = '';
            $scope.showHeadingDrop = 'true';
            $scope.labelPurchaseOrderText = "Display Purchase Order";
        }
        else if ($scope.purchaseOrder.status == 'PENDING' || $scope.purchaseOrder.status == 'REJECTED') {
            $scope.reasonForReject = '';
            $scope.labelLineItem = 'View Line Item';
            $scope.labelPurchaseOrderText = "Display Purchase Order";
        }
        if ($scope.purchaseOrder.status == 'APPROVED' || $scope.purchaseOrder.status == 'REJECTED'){
            $scope.isReadOnlyPO = true;
            $scope.isReadOnlyRequest = true;
        }

        if($scope.changeHeading){
            $scope.labelPurchaseOrderText = "View Purchase Order";
        }

        $scope.suppliers= Suppliers.query(function(data){
            if (typeof $scope.purchaseOrder.supplierUniqueId != undefined && $scope.purchaseOrder.supplierUniqueId) {
                $scope.suppliers.forEach(function (supplierRecord) {
                    if ($scope.purchaseOrder.supplierUniqueId == supplierRecord.uniqueSupplierId || $scope.purchaseOrder.vendor == supplierRecord.companyId) {
                        $scope.supplier = supplierRecord;
                        if($scope.purchaseOrder.paymentTerms == null || typeof $scope.purchaseOrder.paymentTerms === 'undefined'){
                            $scope.purchaseOrder.paymentTerms = $scope.supplier.paymentTerms;
                        }
                        if (!angular.isDefined($scope.purchaseOrder.supplierEmail) || !$scope.purchaseOrder.supplierEmail){
                            $scope.purchaseOrder.supplierEmail = $scope.supplier.email;
                        }
                    }
                } );
            }
        });

        $scope.paymentTermsOrder = PaymentTerms.query();


        $scope.addresses = Address.query(function () {
            $scope.addresses.forEach(function (address) {
                if ($scope.purchaseOrder.shipAddresses && address.id == $scope.purchaseOrder.shipAddresses.id) {
                    $scope.purchaseOrder.shipAddresses = address;
                    $scope.lineItem.shippingAddress = $scope.purchaseOrder.shipAddresses;
                }
                if ($scope.purchaseOrder.companyAddress && address.id == $scope.purchaseOrder.companyAddress.id) {
                    $scope.purchaseOrder.companyAddress = address;
                }
            });
        });
    });

    function fetchVendor() {
        if ($scope.lineItems.length > 0 && null != $scope.lineItems[0].supplierId) {
            $scope.purchaseOrder.vendor = $scope.lineItems[0].supplierId;
        } else {
            $scope.suppliers = Suppliers.query(function (data) {
                $scope.suppliers.forEach(function (supplierRecord) {
                    if ($scope.purchaseOrder.length>0 && $scope.purchaseOrder.items[0].supplierName == supplierRecord.companyName) {
                        $scope.purchaseOrder.vendor = supplierRecord.companyId;
                        $scope.vendorChange();
                        return;
                    }

                });
            });
        }
    }

    PurchaseOrderLineItem.query({orderId: $routeParams.id}, function (data) {
        $scope.lineItems = data;
        if($scope.purchaseOrderVendorAvailable == null){
            fetchVendor();
        }
        for(var itemIndex in $scope.lineItems) {
            $scope.lineItems[itemIndex].categoryName = getCatDesc($scope.lineItems[itemIndex].category);
        }
        $scope.lineItems.forEach(function (lineItem) {
            if(typeof lineItem.categoryName == 'undefined' || lineItem.categoryName == null || lineItem.categoryName == ''){
                lineItem.categoryName = "Other";
            }
        });

        calculateOrderTotalAmounts(data);
        resetItem();
    });

    $scope.setLineItemNo = function(){
        $scope.lineItemNo = $scope.lineItems.length + 1;
    }

    $scope.setDateField = function(type){
        if(type == "product"){
            $scope.lineItem.validityTo = undefined;
            $scope.lineItem.validityFrom = undefined;
            $('#validityTo').val(undefined);
            $('#validityFrom').val(undefined);
            $scope.lineItem.deliveryDate = new Date();
        }else if(type == "service" || type == "recurring service"){
            $scope.lineItem.deliveryDate = undefined;
            $('#deliveryDate').val(undefined);
        }
    }

    function nextItemNumber() {
        var maxItemNumber = 1;
        if (typeof $scope.lineItems === 'undefined' || $scope.lineItems.length === 0) {
            $scope.lineItem.id = maxItemNumber;
        } else {
            $scope.lineItems.forEach(function (lineItem) {
                if (lineItem.id > maxItemNumber) {
                    maxItemNumber = lineItem.id;
                }
                if(typeof lineItem.categoryName == 'undefined' || lineItem.categoryName == null || lineItem.categoryName == ''){
                    lineItem.categoryName = "Other";
                }
            });
            $scope.lineItem.id = parseInt(maxItemNumber) + 1;
        }
    }

    function resetItem() {
        $scope.lineItem = {supplierName: ' '};
        $scope.lineItem.type = 'product';
        $scope.labelLineItem = 'Create Line Item';
        $scope.lineItem.qty = 1;
        $scope.lineItem.deliveryDate = new Date();
        if(typeof $scope.purchaseOrder != 'undefined' && $scope.purchaseOrder){
            if(typeof $scope.purchaseOrder.shipAddresses != 'undefined' && $scope.purchaseOrder.shipAddresses)
            {
                $scope.lineItem.shippingAddress = $scope.purchaseOrder.shipAddresses;
            }
        }

        populateDefaultItemAccountingData();
        populateDefaultItemCurrencyData();
        nextItemNumber();
    }




    $scope.labelCreatePurchaseOrder = "Create Purchase order";



    $scope.countries = CountriesList.query();

    var getCompanyLogo = function() {
        CompanySettings.query(function(item){
            if(item && item.companyIcon) {
                $scope.logoPath = 'icons/' + item.companyIcon;
            } else {
                $scope.logoPath = 'images/logo.png';
            }
        });
    };


    $scope.approverUsers = [];
    $scope.approverUsersOptions = [];

//    $scope.shippingAddresses = Address.query(function () {
//        $scope.shippingAddresses.forEach(function (address) {
//            if ($scope.purchaseRequest.shipAddresses && address.id == $scope.purchaseRequest.shipAddresses.id) {
//                $scope.purchaseRequest.shipAddresses = address;
//            }
//        });
//    });

    $scope.users = Users.query({roles:'approver'},
        function (data) {
            // success callback
            $scope.users.forEach(function(user) {
//                alert(user.userId);
                if(user.active == true){
                    $scope.approverUsers.push(user);
                    $scope.approverUsersOptions.push({ name: user.firstName  + ' ' + user.lastName, value: user.userId });
                }
//                alert($scope.approverUsers.length);
            });
        });

    $scope.vendorChange = function () {
//        alert($scope.purchaseOrder.vendor);
        $scope.selectedSupplier = Suppliers.get({id: $scope.purchaseOrder.vendor}, function(data){
//                alert(data.companyId);
            $scope.supplier = data;
            $scope.purchaseOrder.supplierName = $scope.supplier.companyName;
            $scope.purchaseOrder.supplierEmail = $scope.supplier.email;
            for(var index in $scope.countries) {
                if  ($scope.countries[index].id == $scope.supplier.country) {
                    $scope.supplier.country = $scope.countries[index].name;
                    break;
                }
            }

//            for(var index in $scope.paymentTerms) {
////                alert($scope.supplier.paymentTerms);
//                if  ($scope.paymentTerms[index].paymentTermId == $scope.supplier.paymentTerms) {
////                    alert($scope.paymentTerms[index].paymentTermDescription);
//                    $scope.supplier.paymentTerms = $scope.paymentTerms[index].paymentTermDescription;
//                    break;
//                }
//            }

//            alert($scope.supplier.defaultVendorId);
        });
    };

    getCompanyLogo();

    function populateSupplierData(){
        if($scope.suppliers){
            $scope.suppliers.forEach(function(supplier) {
                if(supplier.companyId ==  $scope.lineItem.supplierId){
                    $scope.lineItem.supplierName = supplier.companyName;
                    $scope.lineItem.supplierId = supplier.companyId;
                }
            });
        }
    }

    var calculateOrderTotalAmounts = function (data) {
        // var totalAmount = 0.00;
        var subTotal = 0.00;
        var shippingCharges = 0.00;
        var taxAmount = 0.00;
        var currencyCode = '';

        if (typeof data === 'undefined') {
            // todo   task
        } else {
            for (var t = 0; t < data.length; t++) {
                shippingCharges += data[t].shippingCharges != null ? parseFloat(data[t].shippingCharges) : 0.00;
                taxAmount += data[t].taxableAmount != null ? parseFloat(data[t].taxableAmount) : 0.00;
                subTotal += (data[t].unitPrice * data[t].qty);
                if (currencyCode === '') {
                    currencyCode = data[t].currency;
                } else if (currencyCode != data[t].currency) {
                    currencyCode = 'MIXED'
                }
            }
        }

        $scope.subTotal = subTotal;
        $scope.shippingCharges = shippingCharges;
        $scope.taxAmount = taxAmount;
        $scope.currencyCode = currencyCode;
        $scope.totalAmount = (subTotal + shippingCharges + taxAmount).toFixed(2);
    };

    $scope.deleteLineItem = function (index) {
        var deadLineItem = $scope.lineItems[index];
        if (confirm("Are you sure you want to delete the line item?")) {
            PurchaseOrderLineItem.destroy({id: deadLineItem.id, orderId: deadLineItem.orderId}, function () {
                $scope.lineItems = PurchaseOrderLineItem.query({orderId: $scope.purchaseOrder.id}, function (data) {
                    for(var itemIndex in $scope.lineItems) {
                        $scope.lineItems[itemIndex].categoryName = getCatDesc($scope.lineItems[itemIndex].category);
                    }
                    calculateOrderTotalAmounts(data);
                    $scope.purchaseOrder.items = data;
                });
            });
        }
    };

    $scope.updateLineItemShippingAddress = function () {
        if(typeof $scope.purchaseOrder != 'undefined' && $scope.purchaseOrder){
            if(typeof $scope.purchaseOrder.shipAddresses != 'undefined' && $scope.purchaseOrder.shipAddresses)
            {
                $scope.lineItem.shippingAddress = $scope.purchaseOrder.shipAddresses;
            }
        }
    };

    function checkCategory(){
        if(typeof $scope.lineItem.category != 'undefined' && $scope.lineItem.category != ''){
            return true;
        } else {
            return false;
        }
    }

    var notyObject;
    $scope.saveLineItem = function () {
        var success = checkCategory();
        if(success){
            var lineItem = this.lineItem;
            if (lineItem.type == 'product') {
                lineItem.deliveryDate = new Date(moment(lineItem.deliveryDate));
            } else {
                lineItem.deliveryDate = new Date(moment(lineItem.validityFrom));
            }
            lineItem.validityFrom = new Date(moment(lineItem.validityFrom));
            lineItem.validityTo = new Date(moment(lineItem.validityTo));
            lineItem.supplierName = $scope.purchaseOrder.supplierName;
            lineItem.supplierId = $scope.purchaseOrder.vendor;

            if($scope.tempData.tempCatName == lineItem.category){
                lineItem.category = $scope.tempData.tempCatCode;
            }

//            delete lineItem.categoryName;

            populateSupplierData();
            if (typeof lineItem.orderId == 'undefined') {
                lineItem.orderId = $scope.purchaseOrder.id;
                PurchaseOrderLineItem.create(lineItem, function (savedItem) {
                    $scope.lineItems = PurchaseOrderLineItem.query({orderId: $scope.purchaseOrder.id}, function (data) {
                        for(var itemIndex in $scope.lineItems) {
                            $scope.lineItems[itemIndex].categoryName = getCatDesc($scope.lineItems[itemIndex].category);
                        }
                        calculateOrderTotalAmounts(data);
                        $scope.purchaseOrder.items = data;
                        resetItem();
                        if (typeof notyObject != 'undefined') {
                            notyObject.close();
                        }
                    });
                });
            } else {
                PurchaseOrderLineItem.save(lineItem, function (savedItem) {
                    PurchaseOrderLineItem.lineItems = PurchaseOrderLineItem.query({orderId: $scope.purchaseOrder.id}, function (data) {
                        for(var itemIndex in $scope.lineItems) {
                            $scope.lineItems[itemIndex].categoryName = getCatDesc($scope.lineItems[itemIndex].category);
                        }
                        calculateOrderTotalAmounts(data);
                        $scope.purchaseOrder.items = data;
                        resetItem();
                        if (typeof notyObject != 'undefined') {
                            notyObject.close();
                        }
                    });
                });
            }

            $scope.closeModal();
        } else {
            notyObject = noty({text: "Please select a valid product category.", type: "error"});
            return false;
        }
    };

    function getCategory(categoryViewValue) {
        var category;

        $scope.categories.forEach(function (item) {
            if (categoryViewValue && (categoryViewValue === item.unspscCode || categoryViewValue === item.unspscCategory)) {
                category = item;
            }
        });
        return category;
    }

    $scope.viewLineItem = function (lineItem, index) {
            $scope.lineItemNo = index + 1;
            $scope.labelLineItem = 'View Line Item';

            $scope.tempData.tempCatCode = lineItem.category;

            var category = getCategory(lineItem.category);
            if (angular.isDefined(category)) {
                lineItem.category = category.unspscCategory;
            }

            $scope.tempData.tempCatName = lineItem.category;

            $scope.lineItem = lineItem;

            $scope.addresses.forEach(function (address) {
                if ($scope.lineItem.shippingAddress && address.id == $scope.lineItem.shippingAddress.id) {
                    $scope.lineItem.shippingAddress = address;
                }
                if (!angular.isDefined($scope.lineItem.shippingAddress) || !$scope.lineItem.shippingAddress){
                    if (angular.isDefined($scope.purchaseOrder.shipAddresses) && $scope.purchaseOrder.shipAddresses){
                        $scope.lineItem.shippingAddress = $scope.purchaseOrder.shipAddresses;
                    }
                }
            });





    //        populateSupplierData();

            $('#lineItemOverlay').modal('show');

    };

    $scope.closeModal = function () {
        //$scope.lineItem = {};
        //$scope.lineItem.type = 'product';
        if (typeof notyObject != 'undefined') {
            notyObject.close();
        }
        resetItem();
        $('.modal').modal('hide');
    };
    $scope.generatePDFOrder = function (purchaseOrder) {
        // document.getElementById('pdfOrderReportsUrl').click();  
        for(var obj in purchaseOrder){                        
            if (purchaseOrder[obj] == null || purchaseOrder[obj] == undefined) {
                purchaseOrder[obj] = "NA";
            }
        }    
        //company address           
        var doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(20, 20, 'Vroozi Purchase Order');

        doc.setFontSize(11);        
        doc.text(20, 40, 'Company Address: ' + purchaseOrder.companyAddress.addressName);            
            doc.text(30, 50, purchaseOrder.companyAddress.addressName);
            doc.text(30, 55, purchaseOrder.companyAddress.street);
            doc.text(30, 60, purchaseOrder.companyAddress.city + ', ' + purchaseOrder.companyAddress.state + ', ' + purchaseOrder.companyAddress.postalCode);
            doc.text(30, 65, purchaseOrder.companyAddress.country);
            doc.text(30, 70, 'Phone: ' + purchaseOrder.companyAddress.country); 
        doc.text(20, 80, 'Approval Required: ' + purchaseOrder.companyAddress.addressName);    
        doc.text(20, 90, 'Vendor Name: ' + purchaseOrder.companyAddress.addressName);    
        //NA need display dynamic value
        doc.text(20, 100, 'Supplier Address: NA');   
        doc.text(20, 110, 'Supplier Email: ' + purchaseOrder.supplierEmail);   
        doc.text(20, 120, 'Shipping Instructions: NA');   





        doc.text(100, 40, 'Order Number: ' + purchaseOrder.orderNumber);                                    
        doc.text(100, 50, 'Order Type: ' + purchaseOrder.purchasingOrganization);
        doc.text(100, 60, 'Order Name: ' + purchaseOrder.orderName);
        // version needs to be dynamic, its static for now
        doc.text(100, 70, 'Version: 1');
        doc.text(100, 80, 'Status: ' + purchaseOrder.status);        
        doc.text(100, 90, 'Requester: ' + purchaseOrder.requester);
        doc.text(100, 100, 'Payment Terms: ' + purchaseOrder.paymentTerms);
        doc.text(100, 110, 'VAT Info: ' + purchaseOrder.vatInfo);
        doc.text(100, 120, 'Creation Date: ' + purchaseOrder.createdDate);
        doc.text(100, 130, 'Revision Date: ' + purchaseOrder.revisionDate);
        doc.text(100, 140, 'Buyer: ' + purchaseOrder.buyer);
        doc.text(100, 150, 'Buyer Contact: ' + purchaseOrder.buyerContact);
        doc.text(100, 160, 'Purchasing Organization: ' + purchaseOrder.purchasingOrganization);
        doc.text(100, 170, 'Purchasing Group: ' + purchaseOrder.purchasingGroup);
        doc.text(100, 180, 'Company Code: ' + purchaseOrder.companyCode);       
        doc.text(100, 190, 'Invoice Comments: ' + purchaseOrder.invoiceComments);


        
        // doc.addPage();        
        // Output as Data URI
        doc.output('datauri');       
        // window.open().document.open();

    };

    $scope.resetClassAddressManagement = function(){
        $('#addressNameDiv').removeClass('error');
        $('#attentionDiv').removeClass('error');
        $('#countryDiv').removeClass('error');
        $('#streetDiv').removeClass('error');
        $('#cityDiv').removeClass('error');
        $('#postalCodeDiv').removeClass('error');
        $('#stateDiv').removeClass('error');
        $('#phoneDiv').removeClass('error');
        $('#taxIdDiv').removeClass('error');
    }

    $scope.resetClassLineItem = function(){
        $('#categoryDiv').removeClass('error');
        $('#descriptionDiv').removeClass('error');
        $('#limitDiv').removeClass('error');
        $('#servicePriceDiv').removeClass('error');
        $('#unitPriceDiv').removeClass('error');
        $('#currencyDiv').removeClass('error');
        $('#uomDiv').removeClass('error');
        $('#deliveryDateDiv').removeClass('error');
        $('#partNoDiv').removeClass('error');
    }

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

    $scope.currencies = Currencies.list(function (data) {
        populateDefaultItemCurrencyData();
    });

    $scope.categories = Categories.list(function (data){
        for(var catIndex in data) {
            $scope.catMap[data[catIndex].unspscCode] = data[catIndex].unspscCategory;
            $scope.revCatMap[data[catIndex].unspscCategory] = data[catIndex].unspscCode;
        }
    });
    $scope.uoms = Uoms.list('', function (data) {
        $scope.uoms = data;
    });

    $scope.reloadUoms = function (performanceFrequency) {

        if (performanceFrequency && performanceFrequency == '') {
            $scope.uoms = Uoms.list('', function (data) {
                $scope.uoms = data;
            });

        } else {

            $scope.uoms = Uoms.list('performanceUOMList', function (data) {
                $scope.uoms = data;
                $scope.lineItem.uom = performanceFrequency;
            });
        }
    };


    $scope.draftPurchaseOrder = function () {
        $scope.purchaseOrder.status = 'DRAFT';
        $scope.purchaseOrder.lastUpdatedDate = new Date();
        $scope.purchaseOrder.effectiveDate = new Date(moment($scope.purchaseOrder.effectiveDate));
        $scope.purchaseOrder.revisionDate = new Date();
//        $scope.purchaseOrder.issueDate = new Date(moment($scope.purchaseOrder.issueDate));
        $scope.purchaseOrder.creationDate = new Date(moment($scope.purchaseOrder.creationDate));
//        populateApproverData();
        $scope.purchaseOrder = PurchaseOrder.save($scope.purchaseOrder, function () {
            if(!flag)
                noty({text: "Your purchase order has been saved.", type: "warning"});
        });
    };

    $scope.newDraftPurchaseOrder = function () {
        //$scope.purchaseOrder.status = 'DRAFT'; FALC-407
        $scope.purchaseOrder.lastUpdatedDate = new Date();
        $scope.purchaseOrder.effectiveDate = new Date(moment($scope.purchaseOrder.effectiveDate));
        $scope.purchaseOrder.revisionDate = new Date();
//        $scope.purchaseOrder.issueDate = new Date(moment($scope.purchaseOrder.issueDate));
        $scope.purchaseOrder.creationDate = new Date(moment($scope.purchaseOrder.creationDate));
//        populateApproverData();
        $scope.purchaseOrder = PurchaseOrder.save($scope.purchaseOrder, function () {
            if(!flag)
                noty({text: "Your purchase order has been saved.", type: "warning"});
        });
    };

    $scope.submitPurchaseOrder = function() {
        if ($scope.lineItems.length == 0) {
            noty({text: "Please add at least one line item to this order", type: "error"});
        } else {
            $scope.purchaseOrder.status = 'APPROVED';
            $scope.purchaseOrder.effectiveDate = new Date(moment($scope.purchaseOrder.effectiveDate));
            $scope.purchaseOrder.issueDate = new Date();
            $scope.purchaseOrder.creationDate = new Date(moment($scope.purchaseOrder.creationDate));
            $scope.purchaseOrder.revisionDate = new Date();
            MessageService.publish('updateOrdersSummary');
//            populateApproverData();
            $scope.purchaseOrder = PurchaseOrder.save($scope.purchaseOrder, function () {
                noty({text: "Your purchase order has been submitted.", type: "warning"});
                $location.path("/overview");
            });
        }
    };

    function populateDefaultItemAccountingData() {
        var costCenterId = DefaultCostCenter.get(function () {
            $scope.costCenters.forEach(function (costCenter) {
                if (costCenter.id == costCenterId.id) {
                    $scope.lineItem.accountingInfo = {costCenter: costCenter.code};
                    $rootScope.defaultAccountingInfo = {costCenter: costCenter.code};
                }
            });
        });
    }

    $scope.costCenters = CostCenters.query(function () {
        populateDefaultItemAccountingData();
    });

    $scope.goBack = function () {
        $location.path("/overview");
    };

    $scope.$on('updateAddresses', function (event, data) {
        $scope.addresses = Address.query(function () {
            $scope.addresses.forEach(function (address) {
                if (address.id == data.id) {
                    $scope.purchaseOrder.shipAddresses = address;
                    $scope.lineItem.shippingAddress = address;
                }
            });
        });
    });

    CompanyCodes.query(function(data){
        $scope.companyCodes = data;
    });
    GLAccounts.query(function(data){
        $scope.gLAccounts = data;
    });
    $scope.setLineItemSaveButtonLabel = function(data){
        if(data == 'EDIT'){
            $scope.saveButtonLabel = "Save Changes";
        }else{
            $scope.saveButtonLabel = "Save Item";
        }
    }
//    $scope.purchaseOrder = {};


//    $scope.createPurchaseOrder = function () {
//        alert('called');
//        $scope.purchaseOrder = PurchaseOrder.create(function () {
//            alert($scope.purchaseOrder.id);
////            $scope.purchaseOrderSummary = PurchaseOrder.summary();
//            $rootScope.currentPurchaseOrder = $scope.purchaseOrder;
//            $location.path("/purchase-order/");
//        });
//    };

    $scope.$on('searchBroadcastPO', function() {
        flag = true;
    });

    $scope.$on('$locationChangeStart', function( event ) {
        if (flag) {
            $scope.newDraftPurchaseOrder();
        }
    });


}
