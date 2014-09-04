'use strict';

//function PurchaseOrderCtrl ($filter, , $http, ,
//                              limitToFilter, PurchaseRequest, LineItem, Addresses,
//                              DefaultShippingAddress,Profiles,
//                              MessageService ,,Uoms,Users, Suppliers, CountriesList) {

function PurchaseOrderCtrl ($scope, $rootScope, $location, $routeParams, PurchaseOrders, Categories, Currencies,
                            DefaultCurrency, DefaultCostCenter, CostCenters) {

    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
  $scope.labelPurchaseOrder = "View Purchase order";
  $scope.editable = false;
  $scope.isReadOnlyRequest = true;

  PurchaseOrders.get({id: $routeParams.id}, function (data) {
    $scope.purchaseOrder = data;
    $scope.isReadOnlyOrder = true;
  });

  $scope.categories = Categories.list();

  $scope.viewLineItem = function (lineItem) {
    $scope.labelLineItem = 'View Line Item';

    var category = getCategory(lineItem.category);
    if (angular.isDefined(category)) {
      lineItem.category = category.unspscCategory;
    }

    $scope.lineItem = lineItem;
    populateSupplierData();

    $('#lineItemOverlay').modal('show');
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

  function populateSupplierData(){
    if($scope.suppliers) {
      $scope.suppliers.forEach(function(supplier) {
        if(supplier.companyId == $scope.lineItem.supplierId){
          $scope.lineItem.supplierName = supplier.companyName;
          $scope.lineItem.supplierId = supplier.companyId;
        }
      });
    }
  }

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
}

//  $scope.itemsCount = 0;
//  $scope.lineItem = {supplierName: ' '};
//
//  PurchaseRequest.get({id: $routeParams.id}, function (data) {
//    $scope.purchaseRequest = data;
//    $rootScope.currentRequest = data;
//    Profiles.query(function (data) {
//      $scope.showApproveButtons = isApproveButtonsDisplay($scope.purchaseRequest, data.userId);
//      $scope.showRejectedMessage = isRejectedMessageDisplay($scope.purchaseRequest, data.userId);
//
//    });
//
//    PurchaseOrders.query({purchaseRequestId: $scope.purchaseRequest.id}, function(orders) {
//      $scope.purchaseOrders = orders;
//    });
//
//    $scope.approverUsers = [];
//    $scope.approverUsersOptions = [];
//    $scope.users = Users.query({roles:'approver'},
//      function (data) {
//        // success callback
//        $scope.users.forEach(function(user) {
//          $scope.approverUsers.push(user);
//          $scope.approverUsersOptions.push({ name: user.firstName  + ' ' + user.lastName, value: user.userId });
//        });
//      });
//
//    if ($scope.purchaseRequest.status == 'NEW') {
//      $scope.labelPurchaseRequest = "Create Purchase Request";
//
//    } else if ($scope.purchaseRequest.status == 'DRAFT') {
//      $scope.labelPurchaseRequest = "Edit Purchase Request";
//
//    } else if ($scope.purchaseRequest.status == 'PENDING' || $scope.purchaseRequest.status == 'APPROVED' || $scope.purchaseRequest.status == 'REJECTED') {
//      $scope.reasonForReject = '';
//      $scope.labelLineItem = 'View Line Item';
//      $scope.labelPurchaseRequest = "View Purchase Request";
//    }
//
//    $scope.shippingAddresses = Addresses.query(function () {
//      $scope.shippingAddresses.forEach(function (address) {
//        if ($scope.purchaseRequest.shipAddresses && address.id == $scope.purchaseRequest.shipAddresses.id) {
//          $scope.purchaseRequest.shipAddresses = address;
//        }
//      });
//    });
//  });
//
//  LineItem.query({requestId: $routeParams.id}, function (data) {
//    $scope.lineItems = data;
//    calculateOrderTotalAmounts(data);
//    resetItem();
//  });
//
//  $scope.uoms = Uoms.list('', function (data) {
//    $scope.uoms = data;
//  });
//
//  $scope.reloadUoms = function (performanceFrequency) {
//
//    if (performanceFrequency && performanceFrequency == '') {
//      $scope.uoms = Uoms.list('', function (data) {
//        $scope.uoms = data;
//      });
//
//    } else {
//
//      $scope.uoms = Uoms.list('performanceUOMList', function (data) {
//        $scope.uoms = data;
//        $scope.lineItem.uom = performanceFrequency;
//      });
//    }
//  };
//
//
//  function nextItemNumber() {
//    var maxItemNumber = 1;
//    if (typeof $scope.lineItems === 'undefined' || $scope.lineItems.length === 0) {
//      $scope.lineItem.id = maxItemNumber;
//    } else {
//      $scope.lineItems.forEach(function (lineItem) {
//        if (lineItem.id > maxItemNumber) {
//          maxItemNumber = lineItem.id;
//        }
//      });
//      $scope.lineItem.id = parseInt(maxItemNumber) + 1;
//    }
//  }
//
//  function resetItem() {
//    $scope.lineItem = {supplierName: ' '};
//    $scope.lineItem.type = 'product';
//    $scope.labelLineItem = 'Create Line Item';
//    $scope.lineItem.qty = 1;
//
//    populateDefaultItemAccountingData();
//    populateDefaultItemCurrencyData();
//    nextItemNumber();
//  }
//
//  $scope.approvePurchaseRequest = function () {
//    $scope.purchaseRequest.status = 'APPROVED';
//    $scope.purchaseRequest.lastUpdatedDate = new Date();
//    $scope.purchaseRequest = PurchaseRequest.save($scope.purchaseRequest, function () {
//      noty({text: "Your purchase request has been approved.", type: "warning"});
//      $location.path("/overview");
//    });
//    $scope.closeModal();
//  };
//
//  $scope.rejectPurchaseRequest = function () {
//    $scope.purchaseRequest.status = 'REJECTED';
//    $scope.purchaseRequest.lastUpdatedDate = new Date();
//    $scope.purchaseRequest = PurchaseRequest.save($scope.purchaseRequest, function () {
//      noty({text: "Your purchase request has been rejected.", type: "warning"});
//      $location.path("/overview");
//    });
//    $scope.closeModal();
//  };
//
//  $scope.draftPurchaseRequest = function () {
//    $scope.purchaseRequest.status = 'DRAFT';
//    $scope.purchaseRequest.lastUpdatedDate = new Date();
//    $scope.purchaseRequest.effectiveDate = new Date(moment($scope.purchaseRequest.effectiveDate));
//    populateApproverData();
//    $scope.purchaseRequest = PurchaseRequest.save($scope.purchaseRequest, function () {
//      noty({text: "Your purchase request has been saved.", type: "warning"});
//    });
//  };
//
//  function populateApproverData() {
//    if ($scope.approverUsers) {
//      $scope.approverUsers.forEach(function (approver) {
//        if (approver.userId == $scope.purchaseRequest.approverId) {
//          $scope.purchaseRequest.approverEmail = approver.username;
//          $scope.purchaseRequest.approverName = approver.firstName + ' ' + approver.lastName;
//          $scope.purchaseRequest.approverId = approver.userId;
//        }
//      });
//    }
//  }
//
//  $scope.changeEditable = function() {
//    $scope.isReadOnlyRequest = false;
//    $scope.editable = false;
//  };
//  $scope.submitPurchaseRequest = function() {
//    if ($scope.lineItems.length == 0) {
//      noty({text: "Please add at least one line item to this request", type: "error"});
//    } else {
//      $scope.purchaseRequest.status = 'PENDING';
//      $scope.purchaseRequest.effectiveDate = new Date(moment($scope.purchaseRequest.effectiveDate));
//      populateApproverData();
//      $scope.purchaseRequest = PurchaseRequest.save($scope.purchaseRequest, function () {
//        noty({text: "Your purchase request has been submitted.", type: "warning"});
//        $location.path("/overview");
//      });
//    }
//  };
//
//  $scope.cancelPurchaseRequest = function () {
//    //$scope.purchaseRequest.status = 'CANCELLED';
//    $location.path("/overview");
//  };
//
//  $scope.saveLineItem = function () {
//    var lineItem = this.lineItem;
//    lineItem.deliveryDate = new Date(moment(lineItem.deliveryDate));
//    lineItem.validityFrom = new Date(moment(lineItem.validityFrom));
//    lineItem.validityTo = new Date(moment(lineItem.validityTo));
//    populateSupplierData();
//    if (typeof lineItem.requestId == 'undefined') {
//      lineItem.requestId = $scope.purchaseRequest.id;
//      LineItem.create(lineItem, function (savedItem) {
//        $scope.lineItems = LineItem.query({requestId: $scope.purchaseRequest.id}, function (data) {
//          calculateOrderTotalAmounts(data);
//          $scope.purchaseRequest.items = data;
//          resetItem();
//        });
//      });
//    } else {
//      LineItem.save(lineItem, function (savedItem) {
//        $scope.lineItems = LineItem.query({requestId: $scope.purchaseRequest.id}, function (data) {
//          calculateOrderTotalAmounts(data);
//          $scope.purchaseRequest.items = data;
//          resetItem();
//        });
//      });
//    }
//
//    $scope.closeModal();
//  };
//  $scope.deleteLineItem = function (index) {
//    var deadLineItem = $scope.lineItems[index];
//    if (confirm("Are you sure you want to delete the line item?")) {
//      LineItem.destroy({id: deadLineItem.id, requestId: deadLineItem.requestId}, function () {
//        $scope.lineItems = LineItem.query({requestId: $scope.purchaseRequest.id}, function (data) {
//          calculateOrderTotalAmounts(data);
//          $scope.purchaseRequest.items = data;
//        });
//      });
//    }
//  };
//
//  $scope.closeModal = function () {
//    //$scope.lineItem = {};
//    //$scope.lineItem.type = 'product';
//    resetItem();
//    $('#type').focus();
//    $('.modal').modal('hide');
//  };
//
//  $scope.saveShippingAddress = function (Addresses) {
//    var address = Addresses.create(this.address);
//    $scope.shippingAddresses.push(address);
//    $scope.purchaseRequest.shipAddresses = address;
//    $scope.closeModal();
//  };
//
//  var calculateOrderTotalAmounts = function (data) {
//    // var totalAmount = 0.00;
//    var subTotal = 0.00;
//    var shippingCharges = 0.00;
//    var taxAmount = 0.00;
//    var currencyCode = '';
//
//    if (typeof data === 'undefined') {
//      // todo   task
//    } else {
//      for (var t = 0; t < data.length; t++) {
//        shippingCharges += data[t].shippingCharges != null ? parseFloat(data[t].shippingCharges) : 0.00;
//        taxAmount += data[t].taxableAmount != null ? parseFloat(data[t].taxableAmount) : 0.00;
//        subTotal += (data[t].unitPrice * data[t].qty);
//        if (currencyCode === '') {
//          currencyCode = data[t].currency;
//        } else if (currencyCode != data[t].currency) {
//          currencyCode = 'MIXED'
//        }
//      }
//    }
//
//    $scope.subTotal = subTotal;
//    $scope.shippingCharges = shippingCharges;
//    $scope.taxAmount = taxAmount;
//    $scope.currencyCode = currencyCode;
//    $scope.totalAmount = (subTotal + shippingCharges + taxAmount).toFixed(2);
//  };
//
//  var isReadOnly = function (order) {
//    if (typeof order === 'undefined') {
//      // todo   task
//    } else {
//      if (order.status == 'APPROVED' || order.status == 'PENDING' || order.status == 'REJECTED') {
//        return true;
//      } else {
//        return false;
//      }
//    }
//  };
//
//  var isRejectedMessageDisplay = function (order, loggedInUserId) {
//    if (typeof order === 'undefined') {
//      // todo   task
//    } else {
//      if (order.status == 'REJECTED') {
//        return true;
//      } else {
//        return false;
//      }
//    }
//  };
//
//  var isApproveButtonsDisplay = function (order, loggedInUserId) {
//    if (typeof order === 'undefined') {
//      // todo   task
//    } else {
//      if (order.status == 'PENDING' && order.userId != loggedInUserId) {
//        return true;
//      } else {
//        return false;
//      }
//    }
//  };
//
//  $scope.$on('updateAddresses', function (event, data) {
//    $scope.shippingAddresses = Addresses.query(function () {
//      $scope.shippingAddresses.forEach(function (address) {
//        if (address.id == data.id) {
//          $scope.purchaseRequest.shipAddresses = address;
//        }
//      });
//    });
//  });
//
//  $scope.suppliers = Suppliers.query(function(supplierData) {
//    // retrieve all countries
//    $scope.countries = CountriesList.query(function(data){
//      for(var entry in $scope.suppliers) {
//        for(var index in $scope.countries) {
//          if  ($scope.countries[index].id == $scope.suppliers[entry].country) {
//            $scope.suppliers[entry].country = $scope.countries[index].name;
//            break;
//          }
//        }
//      }
//    });
//  });
//
//  $scope.priorityOptions = [
//    { name: 'Normal', value: 'Normal' },
//    { name: 'High', value: 'High' },
//    { name: 'Urgent', value: 'Urgent' }
//  ];
//
//  $scope.$watch('purchaseRequest', function (newValue, oldValue) {
//    if (newValue != oldValue) {
//
//      // PurchaseRequest.save($scope.purchaseRequest);
//
//    }
//  }, true);

