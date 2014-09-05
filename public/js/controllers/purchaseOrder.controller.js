'use strict';

function PurchaseOrdersCtrl ($routeParams, $rootScope, $scope, PurchaseOrder,PurchaseOrders, $location,
                             Address, CompanySettings, Suppliers, CountriesList, PaymentTerms, Users,
                             DefaultCurrency,Categories, Uoms, Currencies,DefaultCostCenter,
                             CostCenters,PurchaseOrderLineItem, CompanyCodes, GLAccounts,MessageService, Upload) {


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
        var imgData = 'data:image/jpeg;base64,/9j/4QE2RXhpZgAATU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAAYgEbAAUAAAABAAAAagEoAAMAAAABAAIAAAExAAIAAAAeAAAAcgEyAAIAAAAUAAAAkIdpAAQAAAABAAAApAAAANAACvzaAAAnEAAK/NoAACcQQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykAMjAxNDowOTowNSAwOTozMjoxMAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAm6ADAAQAAAABAAAAHwAAAAAAAAAGAQMAAwAAAAEABgAAARoABQAAAAEAAAEeARsABQAAAAEAAAEmASgAAwAAAAEAAgAAAgEABAAAAAEAAAEuAgIABAAAAAEAAAAAAAAAAAAAAEgAAAABAAAASAAAAAH/7Qj6UGhvdG9zaG9wIDMuMAA4QklNBCUAAAAAABAAAAAAAAAAAAAAAAAAAAAAOEJJTQQ6AAAAAADlAAAAEAAAAAEAAAAAAAtwcmludE91dHB1dAAAAAUAAAAAUHN0U2Jvb2wBAAAAAEludGVlbnVtAAAAAEludGUAAAAAQ2xybQAAAA9wcmludFNpeHRlZW5CaXRib29sAAAAAAtwcmludGVyTmFtZVRFWFQAAAABAAAAAAAPcHJpbnRQcm9vZlNldHVwT2JqYwAAAAwAUAByAG8AbwBmACAAUwBlAHQAdQBwAAAAAAAKcHJvb2ZTZXR1cAAAAAEAAAAAQmx0bmVudW0AAAAMYnVpbHRpblByb29mAAAACXByb29mQ01ZSwA4QklNBDsAAAAAAi0AAAAQAAAAAQAAAAAAEnByaW50T3V0cHV0T3B0aW9ucwAAABcAAAAAQ3B0bmJvb2wAAAAAAENsYnJib29sAAAAAABSZ3NNYm9vbAAAAAAAQ3JuQ2Jvb2wAAAAAAENudENib29sAAAAAABMYmxzYm9vbAAAAAAATmd0dmJvb2wAAAAAAEVtbERib29sAAAAAABJbnRyYm9vbAAAAAAAQmNrZ09iamMAAAABAAAAAAAAUkdCQwAAAAMAAAAAUmQgIGRvdWJAb+AAAAAAAAAAAABHcm4gZG91YkBv4AAAAAAAAAAAAEJsICBkb3ViQG/gAAAAAAAAAAAAQnJkVFVudEYjUmx0AAAAAAAAAAAAAAAAQmxkIFVudEYjUmx0AAAAAAAAAAAAAAAAUnNsdFVudEYjUHhsQFIAk4AAAAAAAAAKdmVjdG9yRGF0YWJvb2wBAAAAAFBnUHNlbnVtAAAAAFBnUHMAAAAAUGdQQwAAAABMZWZ0VW50RiNSbHQAAAAAAAAAAAAAAABUb3AgVW50RiNSbHQAAAAAAAAAAAAAAABTY2wgVW50RiNQcmNAWQAAAAAAAAAAABBjcm9wV2hlblByaW50aW5nYm9vbAAAAAAOY3JvcFJlY3RCb3R0b21sb25nAAAAAAAAAAxjcm9wUmVjdExlZnRsb25nAAAAAAAAAA1jcm9wUmVjdFJpZ2h0bG9uZwAAAAAAAAALY3JvcFJlY3RUb3Bsb25nAAAAAAA4QklNA+0AAAAAABAASAJOAAEAAQBIAk4AAQABOEJJTQQmAAAAAAAOAAAAAAAAAAAAAD+AAAA4QklNBA0AAAAAAAQAAAAeOEJJTQQZAAAAAAAEAAAAHjhCSU0D8wAAAAAACQAAAAAAAAAAAQA4QklNJxAAAAAAAAoAAQAAAAAAAAABOEJJTQP1AAAAAABIAC9mZgABAGxmZgAGAAAAAAABAC9mZgABAKGZmgAGAAAAAAABADIAAAABAFoAAAAGAAAAAAABADUAAAABAC0AAAAGAAAAAAABOEJJTQP4AAAAAABwAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAADhCSU0EAAAAAAAAAgAAOEJJTQQCAAAAAAACAAA4QklNBDAAAAAAAAEBADhCSU0ELQAAAAAABgABAAAAAzhCSU0ECAAAAAAAEAAAAAEAAAJAAAACQAAAAAA4QklNBB4AAAAAAAQAAAAAOEJJTQQaAAAAAAM9AAAABgAAAAAAAAAAAAAAHwAAAJsAAAAEAGwAbwBnAG8AAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAJsAAAAfAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAEAAAAAAABudWxsAAAAAgAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcAAAAfAAAAAFJnaHRsb25nAAAAmwAAAAZzbGljZXNWbExzAAAAAU9iamMAAAABAAAAAAAFc2xpY2UAAAASAAAAB3NsaWNlSURsb25nAAAAAAAAAAdncm91cElEbG9uZwAAAAAAAAAGb3JpZ2luZW51bQAAAAxFU2xpY2VPcmlnaW4AAAANYXV0b0dlbmVyYXRlZAAAAABUeXBlZW51bQAAAApFU2xpY2VUeXBlAAAAAEltZyAAAAAGYm91bmRzT2JqYwAAAAEAAAAAAABSY3QxAAAABAAAAABUb3AgbG9uZwAAAAAAAAAATGVmdGxvbmcAAAAAAAAAAEJ0b21sb25nAAAAHwAAAABSZ2h0bG9uZwAAAJsAAAADdXJsVEVYVAAAAAEAAAAAAABudWxsVEVYVAAAAAEAAAAAAABNc2dlVEVYVAAAAAEAAAAAAAZhbHRUYWdURVhUAAAAAQAAAAAADmNlbGxUZXh0SXNIVE1MYm9vbAEAAAAIY2VsbFRleHRURVhUAAAAAQAAAAAACWhvcnpBbGlnbmVudW0AAAAPRVNsaWNlSG9yekFsaWduAAAAB2RlZmF1bHQAAAAJdmVydEFsaWduZW51bQAAAA9FU2xpY2VWZXJ0QWxpZ24AAAAHZGVmYXVsdAAAAAtiZ0NvbG9yVHlwZWVudW0AAAARRVNsaWNlQkdDb2xvclR5cGUAAAAATm9uZQAAAAl0b3BPdXRzZXRsb25nAAAAAAAAAApsZWZ0T3V0c2V0bG9uZwAAAAAAAAAMYm90dG9tT3V0c2V0bG9uZwAAAAAAAAALcmlnaHRPdXRzZXRsb25nAAAAAAA4QklNBCgAAAAAAAwAAAACP/AAAAAAAAA4QklNBBQAAAAAAAQAAAADOEJJTQQhAAAAAABVAAAAAQEAAAAPAEEAZABvAGIAZQAgAFAAaABvAHQAbwBzAGgAbwBwAAAAEwBBAGQAbwBiAGUAIABQAGgAbwB0AG8AcwBoAG8AcAAgAEMAUwA2AAAAAQA4QklNBAYAAAAAAAcAAgAAAAEBAP/hDilodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDE0LTA5LTA0VDEyOjM5OjU0KzA1OjQ1IiB4bXA6TW9kaWZ5RGF0ZT0iMjAxNC0wOS0wNVQwOTozMjoxMCswNTo0NSIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxNC0wOS0wNVQwOTozMjoxMCswNTo0NSIgZGM6Zm9ybWF0PSJpbWFnZS9qcGVnIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEI5QkExNTBBRjM0RTQxMUE4OUJFNjk5RTgzMEVCQUYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEE5QkExNTBBRjM0RTQxMUE4OUJFNjk5RTgzMEVCQUYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4QTlCQTE1MEFGMzRFNDExQTg5QkU2OTlFODMwRUJBRiI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6OEE5QkExNTBBRjM0RTQxMUE4OUJFNjk5RTgzMEVCQUYiIHN0RXZ0OndoZW49IjIwMTQtMDktMDRUMTI6Mzk6NTQrMDU6NDUiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gaW1hZ2UvcG5nIHRvIGltYWdlL2pwZWciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjhCOUJBMTUwQUYzNEU0MTFBODlCRTY5OUU4MzBFQkFGIiBzdEV2dDp3aGVuPSIyMDE0LTA5LTA1VDA5OjMyOjEwKzA1OjQ1IiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/Pv/iDFhJQ0NfUFJPRklMRQABAQAADEhMaW5vAhAAAG1udHJSR0IgWFlaIAfOAAIACQAGADEAAGFjc3BN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';

        var doc = new jsPDF();
        doc.setFontSize(14);
        doc.addImage(imgData, 'JPEG', 20, 25, 40, 10);
        
       
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
        doc.text(20, 90, 'Vendor Information');   
        doc.line(20, 20, 60, 20);    
        doc.text(20, 95, 'Vendor: ' + purchaseOrder.companyAddress.addressName);            
        doc.text(20, 100, 'Email:' + purchaseOrder.supplierEmail);    
        //mid right
        doc.text(140, 95, 'Address: '); 
        //supplier address needs to be supplier address, is set to PO maker's company address            
            doc.text(140, 99, purchaseOrder.companyAddress.addressName);
            doc.text(140, 103, purchaseOrder.companyAddress.street);
            doc.text(140, 107, purchaseOrder.companyAddress.city + ', ' + purchaseOrder.companyAddress.state + ', ' + purchaseOrder.companyAddress.postalCode);
            doc.text(140, 111, purchaseOrder.companyAddress.country);
            doc.text(140, 115, 'Phone: ' + purchaseOrder.companyAddress.country); 
        //mid bot
        doc.text(20, 120, 'Notes For Supplier: ' + purchaseOrder.notesToSupplier);

        //bot left
        doc.text(20, 130, 'Buyer Information');
        doc.text(20, 140, 'Buyer Name: ' + purchaseOrder.buyer);
        doc.text(20, 145, 'Buyer Contact: ' + purchaseOrder.buyerContact);
        doc.text(20, 150, 'Purchasing Organization: ' + purchaseOrder.purchasingOrganization);
        doc.text(20, 155, 'Purchasing Group: ' + purchaseOrder.purchasingGroup);
        doc.text(20, 160, 'Company Code: ' + purchaseOrder.companyCode);       

        //bot right
        doc.text(140, 130, 'Shipping Infromation');
        doc.text(140, 140, 'Shipping Address: '); 
        //shipping address needs to be supplier address, is set to PO maker's company address            
            doc.text(140, 144, purchaseOrder.companyAddress.addressName);
            doc.text(140, 148, purchaseOrder.companyAddress.street);
            doc.text(140, 152, purchaseOrder.companyAddress.city + ', ' + purchaseOrder.companyAddress.state + ', ' + purchaseOrder.companyAddress.postalCode);
            doc.text(140, 156, purchaseOrder.companyAddress.country);
            doc.text(140, 160, 'Phone: ' + purchaseOrder.companyAddress.country);

        doc.text(140, 165, 'Shipping Instructions: ' + purchaseOrder.shippingInstructions); 



        //next page
        doc.addPage();

        //line items       
        doc.setFontSize(13);
        doc.text(20, 20, 'Line Item');       

        doc.setFontSize(11);
        doc.text(20, 25, 'Description');
        doc.text(50, 25, 'Supplier');
        doc.text(70, 25, 'Qty');
        doc.text(80, 25, 'UOM');            
        doc.text(95, 25, 'Category');
        doc.text(115, 25, 'Part No');
        doc.text(130, 25, 'Unit Price');        
        doc.text(150, 25, 'Delivery Date');
        doc.text(180, 25, 'Total');
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
            doc.text(50, y, item.supplierName);
            doc.text(70, y, ''+item.qty);
            doc.text(80, y, item.uom);            
            doc.text(95, y, item.category);
            doc.text(115, y, item.partNo);
            doc.text(130, y, item.unitPrice);        
            doc.text(150, y, '09/04/2014');
            doc.text(180, y, '$ ' + item.unitPrice * item.qty);

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
        doc.text(145, offsetY, 'Subtotal: $ ' + sub);
        offsetY = offsetY + 5;            
        doc.text(145, offsetY, 'Shipping Charges: $ ' + shipCharge);
        offsetY = offsetY + 5;            
        doc.text(145, offsetY, 'Tax: $ ' + taxAmt);
        offsetY = offsetY + 10;  
        doc.setFontSize(15);          
        doc.text(145, offsetY, 'Total: $ ' + total);


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


    $scope.upload = function(){
        var file = $scope.myFile;
        console.log('file is ' + JSON.stringify(file));
        var uploadUrl = "/sign";
        Upload.uploadFileToUrl(file, uploadUrl);
    };

}
