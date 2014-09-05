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
        
        var sub = $scope.subTotal;
        var shipCharge = $scope.shippingCharges;
        var taxAmt = $scope.taxAmount;
        var total = $scope.totalAmount;

        var doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(20, 20, 'Vroozi Purchase Order');
        
       
        doc.setFontSize(11);
        // doc top right
        doc.text(150, 30, 'PO#: ' + purchaseOrder.orderNumber);
        doc.text(150, 35, 'Status: ' + purchaseOrder.status);
        doc.text(150, 40, 'Order Type: ' + purchaseOrder.orderType);

        // top mid left
        doc.text(20, 50, 'Order Name: ' + purchaseOrder.orderName);
        doc.text(20, 55, 'Requester: ' + purchaseOrder.requester);
            //company address 
                doc.text(20, 60, 'Company Address: ');                                      
                doc.text(30, 64, purchaseOrder.companyAddress.addressName);
                doc.text(30, 68, purchaseOrder.companyAddress.street);
                doc.text(30, 72, purchaseOrder.companyAddress.city + ', ' + purchaseOrder.companyAddress.state + ', ' + purchaseOrder.companyAddress.postalCode);
                doc.text(30, 76, purchaseOrder.companyAddress.country);
                doc.text(30, 80, 'Phone: ' + purchaseOrder.companyAddress.country); 

        // top mid right
        // version needs to be dynamic, its static for now   
        doc.text(145, 50, 'Version: 1');
        //dates needs be dynamic
        doc.text(145, 55, 'Created on: 09/03/2014');
        doc.text(145, 60, 'Issued on: 09/03/2014');
        doc.text(145, 65, 'Revision Date: 09/03/2014');

        //mid left
        doc.text(20, 75, 'Vendor Information');       
        doc.text(20, 80, 'Vendor: ' + purchaseOrder.companyAddress.addressName);    
        //supplier email needs be dynamic
        doc.text(20, 80, 'Email:' + purchaseOrder.supplierEmail);    
        //mid right
        doc.text(140, 75, 'Address: '); 
        //supplier address needs to be supplier address, is set to PO maker's company address            
            doc.text(140, 79, purchaseOrder.companyAddress.addressName);
            doc.text(140, 83, purchaseOrder.companyAddress.street);
            doc.text(140, 87, purchaseOrder.companyAddress.city + ', ' + purchaseOrder.companyAddress.state + ', ' + purchaseOrder.companyAddress.postalCode);
            doc.text(140, 91, purchaseOrder.companyAddress.country);
            doc.text(140, 95, 'Phone: ' + purchaseOrder.companyAddress.country); 
        //mid bot
        doc.text(20, 100, 'Notes For Supplier: ' + purchaseOrder.notesToSupplier);

        //bot left
        doc.text(20, 110, 'Buyer Information');
        doc.text(20, 120, 'Buyer Name: ' + purchaseOrder.buyer);
        doc.text(20, 125, 'Buyer Contact: ' + purchaseOrder.buyerContact);
        doc.text(20, 130, 'Purchasing Organization: ' + purchaseOrder.purchasingOrganization);
        doc.text(20, 135, 'Purchasing Group: ' + purchaseOrder.purchasingGroup);
        doc.text(20, 140, 'Company Code: ' + purchaseOrder.companyCode);       

        //bot right
        doc.text(140, 110, 'Shipping Infromation');
        doc.text(140, 120, 'Shipping Address: '); 
        //shipping address needs to be supplier address, is set to PO maker's company address            
            doc.text(140, 124, purchaseOrder.companyAddress.addressName);
            doc.text(140, 128, purchaseOrder.companyAddress.street);
            doc.text(140, 132, purchaseOrder.companyAddress.city + ', ' + purchaseOrder.companyAddress.state + ', ' + purchaseOrder.companyAddress.postalCode);
            doc.text(140, 136, purchaseOrder.companyAddress.country);
            doc.text(140, 140, 'Phone: ' + purchaseOrder.companyAddress.country);

        doc.text(140, 145, 'Shipping Instructions: ' + purchaseOrder.shippingInstructions); 



        //next page
        doc.addPage();

        //line items       
        doc.setFontSize(13);
        doc.text(20, 20, 'Line Item');       

        doc.setFontSize(11);
        doc.text(20, 25, 'Description');
        doc.text(40, 25, 'Supplier');
        doc.text(50, 25, 'Qty');
        doc.text(60, 25, 'UOM');            
        doc.text(70, 25, 'Category');
        doc.text(100, 25, 'Part No');
        doc.text(120, 25, 'Unit Price');        
        doc.text(90, 25, 'Delivery Date');
        doc.text(140, 25, 'Total');
        var y = 30;
        angular.forEach(purchaseOrder.items, function(item, key) {           
            // return;
            if (null == item.supplierName || undefined == item.supplierName) {
                item.supplierName = 'NA';
            }
            if (null == item.qty || undefined == item.qty) {
                item.qty = 'NA';
            }
            if (null == item.uom || undefined == item.uom) {
                item.uom = 'NA';
            }
            if (null == item.category || undefined == item.category) {
                item.category = 'NA';
            }
            if (null == item.partNo || undefined == item.partNo) {
                item.partNo = 'NA';
            }
            if (null == item.unitPrice || undefined == item.unitPrice) {
                item.unitPrice = 0;
            }
            if (null == item.deliveryDate || undefined == item.deliveryDate) {
                item.deliveryDate = 'NA';
            }

            item.deliveryDate = new Date(moment(item.deliveryDate));

            doc.text(20, y, item.description);
            doc.text(40, y, item.supplierName);
            // doc.text(50, y, item.qty);
            doc.text(60, y, item.uom);            
            doc.text(70, y, item.category);
            doc.text(100, y, item.partNo);
            doc.text(120, y, item.unitPrice);        
            doc.text(90, y, '09/04/2014');
            doc.text(140, y, '$ ' + item.unitPrice * item.qty);

            y = y + 5;            
        });                  
        
        y = y + 5;
        var offsetY = y;
        //bot left
        doc.text(20, y, 'Payment Terms: ' + purchaseOrder.paymentTerms);
        y = y + 5;
        doc.text(20, y, 'VAT Info: ' + purchaseOrder.vatInfo);
        y = y + 5;        
        doc.text(20, y, 'FOB Terms: ' + purchaseOrder.fobTerms);  
        y = y + 5;
        doc.text(20, y, 'Invoice Comments: ' + purchaseOrder.invoiceComments);

        //bot right
        doc.text(45, offsetY, 'Subtotal: $ ' + sub);
        offsetY = offsetY + 5;            
        doc.text(45, offsetY, 'Shipping Charges: $ ' + shipCharge);
        offsetY = offsetY + 5;            
        doc.text(45, offsetY, 'Tax: $ ' + taxAmt);
        offsetY = offsetY + 10;  
        doc.setFontSize(15);          
        doc.text(45, offsetY, 'Total: $ ' + total);


        // console.log($scope.subTotal);
        // doc.addPage();        
        // Output as Data URI
        doc.output('datauri');       
        // window.open().document.open();

    };

    $scope.newPdf = function(){        
        var pdf = new jsPDF('p','pt','a4');
        var source = $('#pdfView')[0];
        var specialElementHandlers = {
            // element with id of "bypass" - jQuery style selector
            '#byPass': function(element, renderer){
                // true = "handled elsewhere, bypass text extraction"
                return true;
            }
        };

        var margins = {
                top: 80,
                bottom: 60,
                left: 40,
                width: 522
            };
        /*pdf.fromHTML(
            source // HTML string or DOM elem ref.
            , margins.left // x coord
            , margins.top // y coord
            , {
                'width': margins.width // max width of content on PDF
                , 'elementHandlers': specialElementHandlers
            },
            function (dispose) {
              // dispose: object with X, Y of the last line add to the PDF
              //          this allow the insertion of new lines after html
                // pdf.save('Test.pdf');
                pdf.output('dataurl');
              },
            margins
        );
*/     

        pdf.addHTML(source,function() {
             pdf.save('Test.pdf');
        });
    }

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
