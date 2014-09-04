'use strict';
/* Controllers */

function AppCtrl($rootScope, $scope, $location, AclControls, $controller) {
    $rootScope.acl = AclControls.query(function (data) {
        $rootScope.acl = data;
    });
    $scope.switchLabel = "Mine";
    /*$controller('RequestsOverviewCtrl', {$scope: $scope});
    $scope.generatePDF = function(){
        var doc = new jsPDF();
        doc.text(20, 20, 'Hello world!');
        doc.text(20, 30, 'This is client-side Javascript, pumping out a PDF.');
        doc.addPage();
        doc.text(20, 20, 'Do you like that?');
        // Output as Data URI
        doc.output('datauri');
    };*/
}

//NotificationCtrl.$inject = ['$scope', 'Notifications'];

function CompanySettingsCtrl($scope, CompanySettings,$rootScope) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.companySettings = CompanySettings.query();
}
//CompanySettingsCtrl.$inject = ['$scope', 'CompanySettings'];

function ControllerFaceText($scope, CompanySettings,SharedService) {
    $scope.companySettings = CompanySettings.query();

        $scope.updateFaceText = function (faceText) {
            CompanySettings.query(function(companySettings){
                companySettings.faceText = faceText;
                CompanySettings.update(companySettings, function (savedItem) {
                    $scope.companySettings = CompanySettings.query();
                    $("#faceTextDiv").html(companySettings.faceText);
                    $scope.handleClick(companySettings.faceText);
                });
            });
            CompanySettings.update(companySettings, function (savedItem) {
              $scope.companySettings = CompanySettings.query();
              $("#faceTextDiv").html(companySettings.faceText);
              $scope.handleClick(companySettings.faceText);
            });
        }

        $scope.reset = function(companySettings) {
            $scope.companySettings.faceText = "";
            CompanySettings.update(companySettings, function (savedItem) {
                $scope.companySettings = CompanySettings.query();
                $scope.handleClick(companySettings.faceText);
            });
        };

        $scope.handleClick = function(msg) {
            SharedService.prepForBroadcast(msg);
        };

        $scope.$on('handleBroadcast', function() {
            $scope.message = SharedService.message;
        });
}

function NavRequestCtrl($scope, $location, $timeout, $rootScope, PurchaseRequest,CompanySettings,SharedService, PurchaseOrder, FilterService,FilterSummary,PurchaseRequestsBoxClickService,$route,PurchaseOrderBoxClickService,PurchaseApprovalBoxClickService, TabService) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.orderSummary = PurchaseRequest.summary();
    $scope.purchaseRequestGrid = true;
    $scope.approvalOrdersGrid = false;
    $scope.purchaseOrdersGrid = false;

    CompanySettings.query(function(data){     
        $scope.companySettings1 = data;
        $("#faceTextDiv").html($scope.companySettings1.faceText);
        if($scope.companySettings1.faceText== "" || $scope.companySettings1.faceText== null){
            $scope.showImage = true;
        } else{
            $scope.showImage = false;
        }

    });

    $scope.PurchaseOrdersSummary = PurchaseOrder.summary();

    function approverPurchaseOrdersSummaries(filterSummary){
        $scope.approverOrdersSummary = filterSummary;
        $scope.pendingApp = filterSummary.pending;
        $scope.atten = filterSummary.rejected;
        $scope.appr = filterSummary.approved;
        //var length = $scope.approverOrders.length ;

    }

    function approverPurchaseOrdersSummary(){
        PurchaseRequest.orders(function  (data) {
            $scope.approverOrders = data;
            $scope.pendingApproval = 0;
            $scope.attention = 0;
            $scope.approved = 0;
            //var length = $scope.approverOrders.length ;
            $scope.approverOrders.forEach(function(approveorder){
                if (approveorder.status == 'PENDING') {
                    $scope.pendingApproval += 1;

                } else if (approveorder.status == 'REJECTED') {
                    $scope.attention += 1;

                }else if (approveorder.status == 'APPROVED') {
                    $scope.approved += 1;
                }
            });
        });
    }
    approverPurchaseOrdersSummary();
    CompanySettings.query(function(data){
        $scope.companySettings1 = data;
        $("#faceTextDiv").html($scope.companySettings1.faceText);
        if($scope.companySettings1.faceText== "" || $scope.companySettings1.faceText== null){
            $scope.showImage = true;
        } else{
            $scope.showImage = false;
        }
    });

    $scope.$on('handleBroadcast', function() {
        $scope.companySettings1.faceText = SharedService.message;
        $("#faceTextDiv").html(SharedService.message);
        if($scope.companySettings1.faceText== "" || $scope.companySettings1.faceText== null){
            $scope.showImage = true;
        } else{
            $scope.showImage = false;
        }
    });

    $scope.$on('updateOrdersSummary', function (event) {
        $scope.orderSummary = PurchaseRequest.summary();
        $scope.PurchaseOrdersSummary = PurchaseOrder.summary();
    });

    $scope.$on('updatePurchaseRequestSummary', function (event) {
        $scope.orderSummary = PurchaseRequest.summary();
    });
    $scope.$on('updatePurchaseOrderSummary', function (event) {
        $scope.PurchaseOrdersSummary = PurchaseOrder.summary();
    });
    $scope.$on('updateAllOrdersSummary', function (event) {
        $scope.orderSummary = PurchaseRequest.summaries();
//        $scope.PurchaseOrdersSummary = PurchaseOrder.summaries();
//        approverPurchaseOrdersSummary();
    });

    $scope.$on('filterSummary', function (event) {
        approverPurchaseOrdersSummaries(FilterSummary.statusParam);
    });


    $scope.createPurchaseRequest = function () {
        $scope.purchaseRequest = PurchaseRequest.create(function () {
            $scope.orderSummary = PurchaseRequest.summary();
            $rootScope.currentRequest = $scope.purchaseRequest;
            $location.path("/purchase-request/" + $scope.purchaseRequest.id);
        });
    };

    $scope.createPurchaseOrder = function () {
//        alert('called');
        $scope.purchaseOrder = PurchaseOrder.create(function () {
//           alert($scope.purchaseOrder.orderNumber);
            $scope.PurchaseOrdersSummary = PurchaseOrder.summary();
            $rootScope.currentPurchaseOrder = $scope.purchaseOrder;
        $location.path("/purchase-order/"+$scope.purchaseOrder.id);
        });
    };

    $scope.createQuickRfx = function () {
        $location.path("/quickrfx/");
    };

    $scope.viewApprovalPurchaseRequests = function (data) {
        //$location.path("/overview/");
        FilterService.prepForBroadcast(data);

    }

    $scope.viewPurchaseRequests = function (data) {
        $location.path("/overview/" + data);
    }

    $scope.viewPurchaseRequestsClick = function (data) {
        PurchaseRequestsBoxClickService.prepForBroadcast(data);
        var currentScreen = $route.current.templateUrl;
        if(currentScreen.split('/').slice(1,2).join() != 'overview.html'){
            $rootScope.prRequestStatus = data;
            $location.path("/overview/" + data +"-ADMIN");
        }
    }

    $scope.viewPurchaseOrdersClick = function (data) {
        PurchaseOrderBoxClickService.prepForBroadcast(data);
        var currentScreen = $route.current.templateUrl;
        if(currentScreen.split('/').slice(1,2).join() != 'overview.html'){
            $location.path("/overview/" + data +"-BUYER");
        }
    }
    $scope.viewApprovalBoxClick = function (data) {
        PurchaseApprovalBoxClickService.prepForBroadcast(data);
        var currentScreen = $route.current.templateUrl;
        if(currentScreen.split('/').slice(1,2).join() != 'overview.html'){
            $location.path("/overview/" + data +"-APPROVER");
        }
    }

    $scope.$on('tabBroadcast', function() {

        $scope.broadcastTab = TabService.tabParam;

        if($scope.broadcastTab == 'purchaseRequest'){
            $scope.purchaseRequestGrid = true;
            $scope.approvalOrdersGrid = false;
            $scope.purchaseOrdersGrid = false;
        }else if($scope.broadcastTab == 'approvalOrders'){
            $scope.purchaseRequestGrid = false;
            $scope.approvalOrdersGrid = true;
            $scope.purchaseOrdersGrid = false;
        }else if($scope.broadcastTab == 'purchaseOrders'){
            $scope.purchaseRequestGrid = false;
            $scope.approvalOrdersGrid = false;
            $scope.purchaseOrdersGrid = true;
        }else{
            $scope.purchaseRequestGrid = true;
            $scope.approvalOrdersGrid = false;
            $scope.purchaseOrdersGrid = false;
        }
    });
}

function TabPannelCtrl($scope, TabService, Profiles, QuickRfx, $compile,$routeParams,$rootScope) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.userAsAdmin = false;
    $scope.userAsEmployee = false;
    $scope.userAsBuyer = false;
    $scope.userAsApprover = false;
    $scope.purchaseRequestTab = false;
    $scope.approvalOrdersTab = false;
    $scope.purchaseOrdersTab = false;
    $scope.showPrRequests = true;
    var tabStatus = $routeParams.status;

    Profiles.query(function (data) {
        $scope.userRoles = data.rolesPerApp.purchaseManagerRoles;
        if($scope.userRoles.length == 1){
            $scope.showTabPannel = false;
            if($scope.userRoles[0] == 'Admin'){
                if(tabStatus && tabStatus.indexOf('-ADMIN')!= -1){
                    $scope.showTabPannel = true;
                    $scope.content = $compile('<div ng-include="\'partials/overviewPrRequest.html\'"></div>')($scope);
                    $('#purchaseRequestTab').addClass('active');
                    $('#approvalOrdersTab').removeClass('active');
                    $('#purchaseOrdersTab').removeClass('active');

                    $('#purchaseRequestLabel').css("color","#0088CC");
                    $('#approvalOrdersLabel').css("color","#808080");
                    $('#purchaseOrdersLabel').css("color","#808080");
                    $('#purchaseRequestLabelM').css("color","#0088CC");
                    $('#approvalOrdersLabelM').css("color","#808080");
                    $('#purchaseOrdersLabelM').css("color","#808080");

                    $scope.purchaseRequestTab = true;
                    $scope.approvalOrdersTab = false;
                    $scope.purchaseOrdersTab = false;

                }else if(tabStatus && tabStatus.indexOf('-APPROVER')!= -1){
                    $scope.showTabPannel = true;
                    $scope.content = $compile('<div ng-include="\'partials/overviewAppOrders.html\'"></div>')($scope);
                    $('#purchaseRequestTab').removeClass('active');
                    $('#approvalOrdersTab').addClass('active');
                    $('#purchaseOrdersTab').removeClass('active');

                    $('#purchaseRequestLabel').css("color","#808080");
                    $('#approvalOrdersLabel').css("color","#0088CC");
                    $('#purchaseOrdersLabel').css("color","#808080");
                    $('#purchaseRequestLabelM').css("color","#808080");
                    $('#approvalOrdersLabelM').css("color","#0088CC");
                    $('#purchaseOrdersLabelM').css("color","#808080");

                    $scope.purchaseRequestTab = false;
                    $scope.approvalOrdersTab = true;
                    $scope.purchaseOrdersTab = false;

                }else if(tabStatus && tabStatus.indexOf('-BUYER')!= -1){
                    $scope.showTabPannel = true;
                    $scope.content = $compile('<div ng-include="\'partials/overviewPrOrders.html\'"></div><div ng-include="\'partials/overviewPrOrders.html\'"></div>')($scope);
                    $('#purchaseRequestTab').removeClass('active');
                    $('#approvalOrdersTab').removeClass('active');
                    $('#purchaseOrdersTab').addClass('active');

                    $('#purchaseRequestLabel').css("color","#808080");
                    $('#approvalOrdersLabel').css("color","#808080");
                    $('#purchaseOrdersLabel').css("color","#0088CC");
                    $('#purchaseRequestLabelM').css("color","#808080");
                    $('#approvalOrdersLabelM').css("color","#808080");
                    $('#purchaseOrdersLabelM').css("color","#0088CC");

                    $scope.purchaseRequestTab = false;
                    $scope.approvalOrdersTab = false;
                    $scope.purchaseOrdersTab = true;

                }else{
                    $scope.showTabPannel = true;
                    $scope.purchaseRequestTab = true;
                    $scope.content = $compile('<div ng-include="\'partials/overviewPrRequest.html\'"></div>')($scope);
                    TabService.prepForBroadcast('purchaseRequest');
                    $('#purchaseRequestTab').addClass('active');
                    $('#purchaseRequestLabel').css("color","#0088CC");
                    $('#approvalOrdersLabel').css("color","#808080");
                    $('#purchaseOrdersLabel').css("color","#808080");
                    $('#purchaseRequestLabelM').css("color","#0088CC");
                    $('#approvalOrdersLabelM').css("color","#808080");
                    $('#purchaseOrdersLabelM').css("color","#808080");
                }
            }else if($scope.userRoles[0] == 'Employee'){
                $scope.content = $compile('<div ng-include="\'partials/overviewPrRequest.html\'"></div>')($scope);
                TabService.prepForBroadcast('purchaseRequest');
                $scope.purchaseRequestTab = true;
            }else if($scope.userRoles[0] == 'Approver'){
                $scope.content = $compile('<div ng-include="\'partials/overviewAppOrders.html\'"></div>')($scope);
                TabService.prepForBroadcast('approvalOrders');
                $scope.approvalOrdersTab = true;
            }else if($scope.userRoles[0] == 'Buyer'){
                $scope.content = $compile('<div ng-include="\'partials/overviewPrOrders.html\'"></div>')($scope);
                TabService.prepForBroadcast('purchaseOrders');
                $scope.purchaseOrdersTab = true;
            }
        }else if(tabStatus && tabStatus.indexOf('-ADMIN')!= -1){
            $scope.showTabPannel = true;
            $scope.content = $compile('<div ng-include="\'partials/overviewPrRequest.html\'"></div>')($scope);
            $('#purchaseRequestTab').addClass('active');
            $('#approvalOrdersTab').removeClass('active');
            $('#purchaseOrdersTab').removeClass('active');

            $('#purchaseRequestLabel').css("color","#0088CC");
            $('#approvalOrdersLabel').css("color","#808080");
            $('#purchaseOrdersLabel').css("color","#808080");
            $('#purchaseRequestLabelM').css("color","#0088CC");
            $('#approvalOrdersLabelM').css("color","#808080");
            $('#purchaseOrdersLabelM').css("color","#808080");

            $scope.purchaseRequestTab = true;
            $scope.approvalOrdersTab = false;
            $scope.purchaseOrdersTab = false;

        }else if(tabStatus && tabStatus.indexOf('-APPROVER')!= -1){
            $scope.showTabPannel = true;
            $scope.content = $compile('<div ng-include="\'partials/overviewAppOrders.html\'"></div>')($scope);
            $('#purchaseRequestTab').removeClass('active');
            $('#approvalOrdersTab').addClass('active');
            $('#purchaseOrdersTab').removeClass('active');

            $('#purchaseRequestLabel').css("color","#808080");
            $('#approvalOrdersLabel').css("color","#0088CC");
            $('#purchaseOrdersLabel').css("color","#808080");
            $('#purchaseRequestLabelM').css("color","#808080");
            $('#approvalOrdersLabelM').css("color","#0088CC");
            $('#purchaseOrdersLabelM').css("color","#808080");

            $scope.purchaseRequestTab = false;
            $scope.approvalOrdersTab = true;
            $scope.purchaseOrdersTab = false;

        }else if(tabStatus && tabStatus.indexOf('-BUYER')!= -1){
            $scope.showTabPannel = true;
            $scope.content = $compile('<div ng-include="\'partials/overviewPrOrders.html\'"></div>')($scope);
            $('#purchaseRequestTab').removeClass('active');
            $('#approvalOrdersTab').removeClass('active');
            $('#purchaseOrdersTab').addClass('active');

            $('#purchaseRequestLabel').css("color","#808080");
            $('#approvalOrdersLabel').css("color","#808080");
            $('#purchaseOrdersLabel').css("color","#0088CC");
            $('#purchaseRequestLabelM').css("color","#808080");
            $('#approvalOrdersLabelM').css("color","#808080");
            $('#purchaseOrdersLabelM').css("color","#0088CC");

            $scope.purchaseRequestTab = false;
            $scope.approvalOrdersTab = false;
            $scope.purchaseOrdersTab = true;

        }
        else{
            $scope.showTabPannel = true;

            $scope.userRoles.forEach(function(userRole){
                if(userRole == 'Admin'){
                    $scope.userAsAdmin = true;

                }else if(userRole == 'Employee'){
                    $scope.userAsEmployee = true;

                }else if(userRole == 'Approver'){
                    $scope.userAsApprover = true;

                }else if(userRole == 'Buyer'){
                    $scope.userAsBuyer = true;
                }
            });

            if($scope.userAsAdmin){
                $scope.content = $compile('<div ng-include="\'partials/overviewPrRequest.html\'"></div>')($scope);
                TabService.prepForBroadcast('purchaseRequest');
                $scope.purchaseRequestTab = true;
                $('#purchaseRequestTab').addClass('active');
                $('#purchaseRequestLabel').css("color","#0088CC");
                $('#approvalOrdersLabel').css("color","#808080");
                $('#purchaseOrdersLabel').css("color","#808080");
                $('#purchaseRequestLabelM').css("color","#0088CC");
                $('#approvalOrdersLabelM').css("color","#808080");
                $('#purchaseOrdersLabelM').css("color","#808080");

            }else if($scope.userAsEmployee){
                $scope.content = $compile('<div ng-include="\'partials/overviewPrRequest.html\'"></div>')($scope);
                TabService.prepForBroadcast('purchaseRequest');
                $scope.purchaseRequestTab = true;
                $('#purchaseRequestTab').addClass('active');
                $('#purchaseRequestLabel').css("color","#0088CC");
                $('#approvalOrdersLabel').css("color","#808080");
                $('#purchaseOrdersLabel').css("color","#808080");
                $('#purchaseRequestLabelM').css("color","#0088CC");
                $('#approvalOrdersLabelM').css("color","#808080");
                $('#purchaseOrdersLabelM').css("color","#808080");

            }else if($scope.userAsApprover){
                $scope.content = $compile('<div ng-include="\'partials/overviewAppOrders.html\'"></div>')($scope);
                TabService.prepForBroadcast('approvalOrders');
                $scope.approvalOrdersTab = true;
                $('#approvalOrdersTab').addClass('active');
                $('#purchaseRequestLabel').css("color","#808080");
                $('#approvalOrdersLabel').css("color","#0088CC");
                $('#purchaseOrdersLabel').css("color","#808080");
                $('#purchaseRequestLabelM').css("color","#808080");
                $('#approvalOrdersLabelM').css("color","#0088CC");
                $('#purchaseOrdersLabelM').css("color","#808080");

            }else if($scope.userAsBuyer){
                $scope.content = $compile('<div ng-include="\'partials/overviewPrOrders.html\'"></div>')($scope);
                TabService.prepForBroadcast('purchaseOrders');
                $scope.approvalOrdersTab = true;
                $('#purchaseOrdersTab').addClass('active');
                $('#purchaseRequestLabel').css("color","#808080");
                $('#approvalOrdersLabel').css("color","#808080");
                $('#purchaseOrdersLabel').css("color","#0088CC");
                $('#purchaseRequestLabelM').css("color","#808080");
                $('#approvalOrdersLabelM').css("color","#808080");
                $('#purchaseOrdersLabelM').css("color","#0088CC");

            }
        }
    });

    $scope.overviewTab = function(input){
        if(input == 'purchaseRequest'){
            $('#purchaseRequestTab').addClass('active');
            $('#approvalOrdersTab').removeClass('active');
            $('#purchaseOrdersTab').removeClass('active');

            $('#purchaseRequestLabel').css("color","#0088CC");
            $('#approvalOrdersLabel').css("color","#808080");
            $('#purchaseOrdersLabel').css("color","#808080");
            $('#purchaseRequestLabelM').css("color","#0088CC");
            $('#approvalOrdersLabelM').css("color","#808080");
            $('#purchaseOrdersLabelM').css("color","#808080");

            $scope.purchaseRequestTab = true;
            $scope.approvalOrdersTab = false;
            $scope.purchaseOrdersTab = false;
        }else if(input == 'approvalOrders'){

            $('#purchaseRequestTab').removeClass('active');
            $('#approvalOrdersTab').addClass('active');
            $('#purchaseOrdersTab').removeClass('active');

            $('#purchaseRequestLabel').css("color","#808080");
            $('#approvalOrdersLabel').css("color","#0088CC");
            $('#purchaseOrdersLabel').css("color","#808080");
            $('#purchaseRequestLabelM').css("color","#808080");
            $('#approvalOrdersLabelM').css("color","#0088CC");
            $('#purchaseOrdersLabelM').css("color","#808080");

            $scope.purchaseRequestTab = false;
            $scope.approvalOrdersTab = true;
            $scope.purchaseOrdersTab = false;
        }else if(input == 'purchaseOrders'){
            $('#purchaseRequestTab').removeClass('active');
            $('#approvalOrdersTab').removeClass('active');
            $('#purchaseOrdersTab').addClass('active');

            $('#purchaseRequestLabel').css("color","#808080");
            $('#approvalOrdersLabel').css("color","#808080");
            $('#purchaseOrdersLabel').css("color","#0088CC");
            $('#purchaseRequestLabelM').css("color","#808080");
            $('#approvalOrdersLabelM').css("color","#808080");
            $('#purchaseOrdersLabelM').css("color","#0088CC");

            $scope.purchaseRequestTab = false;
            $scope.approvalOrdersTab = false;
            $scope.purchaseOrdersTab = true;
        }else{
            $('#purchaseRequestTab').addClass('active');
            $('#approvalOrdersTab').removeClass('active');
            $('#purchaseOrdersTab').removeClass('active');

            $('#purchaseRequestLabel').css("color","#0088CC");
            $('#approvalOrdersLabel').css("color","#808080");
            $('#purchaseOrdersLabel').css("color","#808080");
            $('#purchaseRequestLabelM').css("color","#0088CC");
            $('#approvalOrdersLabelM').css("color","#808080");
            $('#purchaseOrdersLabelM').css("color","#808080");

            $scope.purchaseRequestTab = true;
            $scope.approvalOrdersTab = false;
            $scope.purchaseOrdersTab = false;
        }
        TabService.prepForBroadcast(input);
    }
    $scope.selectTab = function(tab){
        if(tab == 'PrRequests'){
            $scope.content = $compile('<div ng-include="\'partials/overviewPrRequest.html\'"></div>')($scope);
        }else if(tab == 'PrOrders'){
            $scope.content = $compile('<div ng-include="\'partials/overviewPrOrders.html\'"></div>')($scope);
        }else if(tab == 'AppOrders'){
            $scope.content = $compile('<div ng-include="\'partials/overviewAppOrders.html\'"></div>')($scope);
        }
    }
    $scope.filterByRoute= function(item){ return item.buyRoute === 'true'; }

}

function PurchaseRequestCtrl ($routeParams, $scope, $filter, $location, $http, $rootScope,
                              limitToFilter, PurchaseRequest, PurchaseOrders, LineItem, Addresses,
                              DefaultShippingAddress,DefaultCostCenter,CostCenters,Profiles, GLAccounts,
                              MessageService, Currencies ,DefaultCurrency,DefaultCompanyBuyerGroup, Categories,Uoms,Users, Suppliers, CountriesList, BuyerGroupByCategoryAndSupplier, BuyerGroupService, BuyerGroupById) {

    $scope.itemsCount = 0;
    $scope.editable = true;
    $scope.lineItem = {supplierName: ' '};
    $scope.idOrder = $routeParams.id;
    $scope.showSupplierFields = true;

    $scope.tempData = {};
    $scope.tempData.recommendedSupplier=true;
    $scope.tempData.availableSupplier=true;
    $scope.catMap = new Object();
    $scope.revCatMap = new Object();
    $scope.loadingMessagePO = true;
    $scope.noContentPO = false;
    $rootScope.fromPOPage = false;
    $rootScope.fromPRPage = true;
    var flag = false;

    function getCatDesc(k) {
        return $scope.catMap[k];
    }

    function getCatCode(k) {
        return $scope.revCatMap[k];
    }

    PurchaseRequest.get({id: $routeParams.id}, function (data) {
        $scope.purchaseRequest = data;
        $rootScope.currentRequest = data;
        $scope.requestNumber = $scope.purchaseRequest.orderNumber;
        $scope.requestOrder = '3'+$scope.requestNumber.substring(1,$scope.requestNumber.length);
        console.log($scope.requestNumber);
        console.log($scope.requestOrder);

        var reportsUrl = '/api/pdfreports/'+ $scope.purchaseRequest.id + '?status=approved';
        $scope.pdfReportsUrl = reportsUrl;

        if ($scope.purchaseRequest.status == 'APPROVED'){
            $scope.showPrintButton = true;
        }else{
            $scope.showPrintButton = false;
        }

        Profiles.query(function (data) {
            $scope.showApproveButtons = isApproveButtonsDisplay($scope.purchaseRequest, data.userId);
            $scope.showRejectedMessage = isRejectedMessageDisplay($scope.purchaseRequest, data.userId);

        });

        PurchaseOrders.poquery({purchaseRequestId: $scope.purchaseRequest.id}, function(orders) {
          $scope.purchaseOrders = orders;
            if($scope.purchaseOrders.length > 0){
                $scope.loadingMessagePO = false;
            }
            if($scope.purchaseOrders.length == 0){
                $scope.loadingMessagePO = false;
                $scope.noContentPO = true;
            }
        });

        $scope.approverUsers = [];
        $scope.approverUsersOptions = [];
        $scope.users = Users.query({roles:'approver'},
            function (data) {
                // success callback
                $scope.users.forEach(function(user) {
                    if(user.active == true && user.userId != $scope.purchaseRequest.userId){
                    $scope.approverUsers.push(user);
                    $scope.approverUsersOptions.push({ name: user.firstName  + ' ' + user.lastName, value: user.userId });
                    }
                });
        });
        setDefaultBuyerGroup();
        function setDefaultBuyerGroup(){
            DefaultCompanyBuyerGroup.get(function(data){
                $scope.showBuyerGroupText = true;  // display buyer group as field
                $scope.showBuyerGroupSelect = false;

                $scope.buyerGroups = data;
                $scope.buyerGroupName = data.groupName;
                $scope.lineItem.buyerGroupId = data.id;
            });
        }
        $scope.populateBuyerGroups = function(categoryCode, supplier){
            $scope.showBuyerGroupText = false;
            $scope.showBuyerGroupSelect = false;
            $scope.showBuyerGroups = checkCategory();
            if(categoryCode && supplier){
                BuyerGroupByCategoryAndSupplier.query({categoryCode:categoryCode, supplier: supplier}, function(result){
                    if(result == null || result == [] || result.length == 0){
                        setDefaultBuyerGroup();
                    }else{
                        $scope.buyerGroups = result;

                        if($scope.buyerGroups.length == 1){
                            $scope.buyerGroupName = $scope.buyerGroups[0].groupName;
                            $scope.showBuyerGroupText = true;  // display buyer group as field
                            $scope.showBuyerGroupSelect = false;

                        }else{
                            $scope.showBuyerGroupText = false;  // display buyer group as select options
                            $scope.showBuyerGroupSelect = true;

                        }
                        $scope.lineItem.buyerGroupId = $scope.buyerGroups[0].id;
                    }
                });
            }else{
                setDefaultBuyerGroup();
            }
        }
//        $scope.requestNumber = $scope.purchaseRequest.orderNumber;
        $scope.isReadOnlyRequest = isReadOnly($scope.purchaseRequest);
        $scope.goBackPurchase = false;
        $scope.goBackPurchasePending = false;

        if ($scope.purchaseRequest.status == 'PENDING') {
            $scope.goBackPurchasePending = true;
        }
        if ($scope.purchaseRequest.status == 'NEW') {
            $scope.labelPurchaseRequest = "Create Purchase Request";
            $scope.goBackPurchase = true;

        } else if ($scope.purchaseRequest.status == 'DRAFT') {
            $scope.labelPurchaseRequest = "Edit Purchase Request";
            $scope.goBackPurchase = true;

        } else if ($scope.purchaseRequest.status == 'APPROVED' || $scope.purchaseRequest.status == 'SENT') {
            $scope.reasonForReject = '';
            $scope.showHeadingDrop = 'true';
            $scope.labelPurchaseRequest = "View Purchase Request";
        }
        else if ($scope.purchaseRequest.status == 'PENDING' || $scope.purchaseRequest.status == 'REJECTED') {
            $scope.reasonForReject = '';
            $scope.labelLineItem = 'View Line Item';
            $scope.labelPurchaseRequest = "View Purchase Request";
        }

        $scope.addresses = Addresses.query(function () {
            $scope.addresses.forEach(function (address) {
                if ($scope.purchaseRequest.shipAddresses && address.id == $scope.purchaseRequest.shipAddresses.id) {
                    $scope.purchaseRequest.shipAddresses = address;
                    $scope.lineItem.shippingAddress = $scope.purchaseRequest.shipAddresses;
                }
            });
        });
//        $scope.addresses = $scope.shippingAddresses;
    });

    LineItem.query({requestId: $routeParams.id}, function (data) {
        $scope.lineItems = data;

        for(var itemIndex in $scope.lineItems) {
            $scope.lineItems[itemIndex].categoryName = getCatDesc($scope.lineItems[itemIndex].category);
        }

        calculateOrderTotalAmounts(data);
        resetItem();
    });

    $scope.setLineItemNo = function(){
        $scope.lineItemNo = $scope.lineItems.length + 1;
    }

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

    function checkCategory(){
        if(typeof $scope.lineItem.category != 'undefined' && $scope.lineItem.category != ''){
            return true;
        } else {
            return false;
        }
    }

    $scope.updateLineItemShippingAddress = function () {
        if(typeof $scope.purchaseRequest != 'undefined' && $scope.purchaseRequest){
            if(typeof $scope.purchaseRequest.shipAddresses != 'undefined' && $scope.purchaseRequest.shipAddresses)
            {
                $scope.lineItem.shippingAddress = $scope.purchaseRequest.shipAddresses;
            }
        }
    };

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

    var notyObject;
    $scope.saveLineItem = function() {
        var success = checkCategory();
        if(success){
            if ((typeof $scope.lineItem.supplierName == 'undefined' || $scope.lineItem.supplierName == '') && !$scope.lineItem.recommendedSupplier) {
    //            var userEnteredSupplier = document.getElementById('supplier').value;
                $scope.lineItem.supplierId = '';
                var userEnteredSupplier = $('#supplier').val();
            }
            if ((typeof $scope.lineItem.supplierName == 'undefined' || $scope.lineItem.supplierName == '') && !$scope.lineItem.recommendedSupplier && userEnteredSupplier) {
               Suppliers.query({"suppliername":userEnteredSupplier}, function(data) {
                   if (typeof data != 'undefined' && data.length > 0) {
                       $scope.saveLineItemFunction($scope.lineItem);
                       if (typeof notyObject != 'undefined') {
                           notyObject.close();
                       }
                       return true;
                   } else {
                       notyObject = noty({text: "Specified supplier cannot be found. Please provide a 'Recommended Supplier'", timeout:false, type: "error"});
                       return false;
                   }

                    }, function(err) {

               })
           } else {
               $scope.saveLineItemFunction($scope.lineItem);
               if (typeof notyObject != 'undefined') {
                   notyObject.close();
               }
               return true;
           }
        } else {
            notyObject = noty({text: "Please select a valid product category", type: "error"});
            return false;
        }
    };

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

    $scope.costCenters = CostCenters.query(function () {
        populateDefaultItemAccountingData();
    });

    $scope.currencies = Currencies.list(function (data) {
        populateDefaultItemCurrencyData();
    });

    $scope.approvePurchaseRequest = function () {
        $scope.purchaseRequest.status = 'APPROVED';
        $scope.purchaseRequest.lastUpdatedDate = new Date();
        $scope.purchaseRequest = PurchaseRequest.save($scope.purchaseRequest, function () {
            noty({text: "Your purchase request has been approved.", type: "warning"});
            $location.path("/overview");
        });
        $scope.closeModal();
    };

    $scope.rejectPurchaseRequest = function () {
        $scope.purchaseRequest.status = 'REJECTED';
        $scope.purchaseRequest.lastUpdatedDate = new Date();
        $scope.purchaseRequest = PurchaseRequest.save($scope.purchaseRequest, function () {
            noty({text: "Your purchase request has been rejected.", type: "warning"});
            $location.path("/overview");
        });
        $scope.closeModal();
    };

    $scope.draftPurchaseRequest = function () {
        $scope.purchaseRequest.status = 'DRAFT';
        $scope.purchaseRequest.lastUpdatedDate = new Date();
        $scope.purchaseRequest.effectiveDate = new Date(moment($scope.purchaseRequest.effectiveDate));
        populateApproverData();
        $scope.purchaseRequest = PurchaseRequest.save($scope.purchaseRequest, function () {
            if(!flag)
                noty({text: "Your purchase request has been saved.", type: "warning"});
            $scope.addresses.forEach(function (address) {
                if ($scope.purchaseRequest.shipAddresses && address.id == $scope.purchaseRequest.shipAddresses.id) {
                    $scope.purchaseRequest.shipAddresses = address;
                }
            });
        });
    };

    function populateApproverData() {
        if ($scope.approverUsers) {
            $scope.approverUsers.forEach(function (approver) {
                if (approver.userId == $scope.purchaseRequest.approverId) {
                    $scope.purchaseRequest.approverEmail = approver.email;
                    $scope.purchaseRequest.approverName = approver.firstName + ' ' + approver.lastName;
                    $scope.purchaseRequest.approverId = approver.userId;
                }
            });
        }
    }

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

    $scope.populateSupplierId = function(){
//        alert($scope.lineItem.supplierName);
        if($scope.suppliers){
            $scope.suppliers.forEach(function(supplier) {
                if(supplier.companyName ==  $scope.lineItem.supplierName){
                    $scope.lineItem.supplierName = supplier.companyName;
                    $scope.lineItem.supplierId = supplier.companyId;
                    $scope.lineItem.supplierUniqueId = supplier.uniqueSupplierId;
                
                    if(supplier.buyRoute){
                        $scope.lineItem.buyRoute = true;
                    }else{
                        $scope.lineItem.buyRoute = false;
                    }
                }
            });
        }
    }

    $scope.updateSupplierData = function(fromTypeAhead) {
//        alert($scope.lineItem.supplierName.length);
        if (fromTypeAhead) {
            $scope.lineItem.recommendedSupplier = '';
        } else {
            $scope.lineItem.supplierName = '';
            $scope.lineItem.supplierId = '';
        }
        if (typeof $scope.lineItem.supplierName!= 'undefined' && $scope.lineItem.supplierName!= '' && ($scope.lineItem.supplierName || $scope.lineItem.supplierName.length>0) || typeof $scope.lineItem.recommendedSupplier != 'undefined' && $scope.lineItem.recommendedSupplier!= '' && ($scope.lineItem.recommendedSupplier || $scope.lineItem.recommendedSupplier.length>0)) {
            $scope.tempData.availableSupplier=fromTypeAhead?true:false;
            $scope.tempData.recommendedSupplier=fromTypeAhead?false:true;
        } else {
            $scope.tempData.availableSupplier=true;
            $scope.tempData.recommendedSupplier=true;
        }
    };

//    $scope.$watch('lineItem.supplierName', function (newValue, oldValue) {
////        alert('hello');
////        alert($scope.lineItem.supplierName.length);
//        if (typeof $scope.lineItem.supplierName == 'undefined') {
//            $scope.tempData.availableSupplier=true;
//            $scope.tempData.recommendedSupplier=true;
//        }
//    });

    $scope.changeEditable = function() {
        $scope.isReadOnlyRequest = false;
        $scope.editable = false;
    };
    $scope.submitPurchaseRequest = function() {
        if ($scope.lineItems.length == 0) {
            noty({text: "Please add at least one line item to this request", type: "error"});
        } else {
            $scope.purchaseRequest.status = 'PENDING';
            $scope.purchaseRequest.effectiveDate = new Date(moment($scope.purchaseRequest.effectiveDate));
            if($scope.purchaseRequest.items.length > 0){
                $scope.purchaseRequest.items.forEach(function(item){
                    if(null != item.supplierName && item.supplierName == ''){
                        item.supplierName = item.recommendedSupplier;
                    }
                });
            }
            populateApproverData();
            $scope.purchaseRequest = PurchaseRequest.save($scope.purchaseRequest, function () {
                noty({text: "Your purchase request has been submitted.", type: "warning"});
                $location.path("/overviewPrRequest");
            });
        }
    };

    $scope.cancelPurchaseRequest = function () {
        //$scope.purchaseRequest.status = 'CANCELLED';
        $location.path("/overview");
    };

    $scope.goBack = function () {
        $location.path("/overview");
    };

    $scope.getSupplierName = function(lineItem) {
        return lineItem.supplierName?lineItem.supplierName:lineItem.recommendedSupplier;
    };

    $scope.saveLineItemFunction = function () {
        var lineItem = this.lineItem;
        if (lineItem.type && lineItem.deliveryDate && lineItem.type == 'product') {
            lineItem.deliveryDate = new Date(moment(lineItem.deliveryDate));
        } else if(lineItem.validityFrom){
            lineItem.deliveryDate = new Date(moment(lineItem.validityFrom));
        }
        lineItem.validityFrom = new Date(moment(lineItem.validityFrom));
        lineItem.validityTo = new Date(moment(lineItem.validityTo));

        if($scope.tempData.tempCatName == lineItem.category){
            lineItem.category = $scope.tempData.tempCatCode;
        }

        delete lineItem.categoryName;

        populateSupplierData();
        if (typeof lineItem.requestId == 'undefined') {
            lineItem.requestId = $scope.purchaseRequest.id;
            LineItem.create(lineItem, function (savedItem) {
                $scope.lineItems = LineItem.query({requestId: $scope.purchaseRequest.id}, function (data) {

                    for(var itemIndex in $scope.lineItems) {
                        $scope.lineItems[itemIndex].categoryName = getCatDesc($scope.lineItems[itemIndex].category);
                    }

                    calculateOrderTotalAmounts(data);
                    $scope.purchaseRequest.items = data;
                    resetItem();
                });
            });
        } else {
            LineItem.save(lineItem, function (savedItem) {
                $scope.lineItems = LineItem.query({requestId: $scope.purchaseRequest.id}, function (data) {

                    for(var itemIndex in $scope.lineItems) {
                        $scope.lineItems[itemIndex].categoryName = getCatDesc($scope.lineItems[itemIndex].category);
                    }

                    calculateOrderTotalAmounts(data);
                    $scope.purchaseRequest.items = data;
                    resetItem();
                });
            });
        }

        $scope.closeModal();
    };

    $scope.editLineItem = function (lineItem, index) {
        $scope.lineItemNo = index + 1;
        $scope.labelLineItem = isReadOnly($scope.purchaseRequest) ? 'View Line Item' : 'Edit Line Item';

        $scope.tempData.tempCatCode = lineItem.category;

        var category = getCategory(lineItem.category);
        if (angular.isDefined(category)) {
            lineItem.category = category.unspscCategory;
        }

        if(lineItem.buyerGroupId && lineItem.supplierId && category){
            BuyerGroupByCategoryAndSupplier.query({categoryCode:category.unspscCode,supplier:lineItem.supplierId}, function(result){
                if(result == null || result == [] || result.length == 0){
                    $scope.showBuyerGroupText = true;  // display buyer group as field
                    $scope.showBuyerGroupSelect = false;
                    BuyerGroupById.query({groupId:lineItem.buyerGroupId}, function(buyerGroup){
                        $scope.buyerGroups = buyerGroup;
                        $scope.buyerGroupName = buyerGroup.groupName;
                    });

                }else{
                    $scope.buyerGroups = result

                    if($scope.buyerGroups.length == 1){
                        $scope.buyerGroupName = $scope.buyerGroups[0].groupName;
                        $scope.showBuyerGroupText = true;  // display buyer group as field
                        $scope.showBuyerGroupSelect = false;

                    }else{
                        $scope.showBuyerGroupText = false;  // display buyer group as select options
                        $scope.showBuyerGroupSelect = true;

                    }
                }
            });
        }else if(lineItem.buyerGroupId){
                $scope.showBuyerGroupText = true;  // display buyer group as field
                $scope.showBuyerGroupSelect = false;
                BuyerGroupById.query({groupId:lineItem.buyerGroupId}, function(buyerGroup){
                    $scope.buyerGroups = buyerGroup;
                    $scope.buyerGroupName = buyerGroup.groupName;
                });
            }else{
                DefaultCompanyBuyerGroup.get(function(data){
                    $scope.buyerGroupName = data.groupName;
                    $scope.showBuyerGroupText = true;  // display buyer group as field
                    $scope.showBuyerGroupSelect = false;
                    lineItem.buyerGroupId = data.id;
                });
            }

        $scope.tempData.tempCatName = lineItem.category;

        $scope.lineItem = lineItem;

        $scope.addresses.forEach(function (address) {
            if ($scope.lineItem.shippingAddress && address.id == $scope.lineItem.shippingAddress.id) {
                $scope.lineItem.shippingAddress = address;
            }
            if (!angular.isDefined($scope.lineItem.shippingAddress) || !$scope.lineItem.shippingAddress){
                if (angular.isDefined($scope.purchaseRequest.shipAddresses) && $scope.purchaseRequest.shipAddresses){
                    $scope.lineItem.shippingAddress = $scope.purchaseRequest.shipAddresses;
                }
            }
        });

        if ($scope.lineItem.supplierName || $scope.lineItem.recommendedSupplier) {

            $scope.tempData.availableSupplier=$scope.lineItem.supplierName?true:false;
            $scope.tempData.recommendedSupplier=$scope.lineItem.supplierName?false:true;
        }
        populateSupplierData();

        $('#lineItemOverlay').modal('show');
    };

    $scope.deleteLineItem = function (index) {
        var deadLineItem = $scope.lineItems[index];
        if (confirm("Are you sure you want to delete the line item?")) {
            LineItem.destroy({id: deadLineItem.id, requestId: deadLineItem.requestId}, function () {
                $scope.lineItems = LineItem.query({requestId: $scope.purchaseRequest.id}, function (data) {
                    calculateOrderTotalAmounts(data);
                    $scope.purchaseRequest.items = data;
                    resetItem();
                });
            });
        }
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

    $scope.resetClass = function(){
        $('#categoryDiv').removeClass('error');
        $('#buyerGroupSelectDiv').removeClass('error');
        $('#buyerGroupTextDiv').removeClass('error');
        $('#descriptionDiv').removeClass('error');
        $('#limitDiv').removeClass('error');
        $('#servicePriceDiv').removeClass('error');
        $('#unitPriceDiv').removeClass('error');
        $('#currencyDiv').removeClass('error');
        $('#uomDiv').removeClass('error');
        $('#deliveryDateDiv').removeClass('error');
        $('#partNoDiv').removeClass('error');
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

    $scope.saveShippingAddress = function (Addresses) {
        var address = Addresses.create(this.address);
        $scope.addresses.push(address);
        $scope.purchaseRequest.shipAddresses = address;
        $scope.closeModal();
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
//    $scope.reports = {"reportId": 1, "status": "ALL", "timePeriod": 0, "days": 30};

    //$scope.reports.isDateRange  = $scope.reports.timePeriod==1;


    $scope.generatePDF = function (purchaseRequestId) {

        //	$location.path( reportUrl );
//        document.getElementById('pdfReportsUrl').href = pdfReportsUrl;
        document.getElementById('pdfReportsUrl').click();
    };

    $scope.goBack = function () {
        $location.path("/overview");
    };
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

    var isReadOnly = function (order) {
        if (typeof order === 'undefined') {
            // todo   task
        } else {
            if (order.status == 'APPROVED' || order.status == 'PENDING' || order.status == 'REJECTED' || order.status == 'SENT') {
                return true;
            } else {
                return false;
            }
        }
    };

    var isRejectedMessageDisplay = function (order, loggedInUserId) {
        if (typeof order === 'undefined') {
            // todo   task
        } else {
            if (order.status == 'REJECTED') {
                return true;
            } else {
                return false;
            }
        }
    };

    var isApproveButtonsDisplay = function (order, loggedInUserId) {
        if (typeof order === 'undefined') {
            // todo   task
        } else {
            if (order.status == 'PENDING' && order.userId != loggedInUserId) {
                return true;
            } else {
                return false;
            }
        }
    };

    $scope.$on('updateAddresses', function (event, data) {
        $scope.addresses = Addresses.query(function () {
            $scope.addresses.forEach(function (address) {
                if (address.id == data.id) {
                    $scope.purchaseRequest.shipAddresses = address;
                    $scope.lineItem.shippingAddress = address;
                }
            });
        });
    });

    $scope.suppliers = Suppliers.query(function(supplierData) {
        // retrieve all countries
        $scope.countries = CountriesList.query(function(data){
            for(var entry in $scope.suppliers) {
                for(var index in $scope.countries) {
                    if  ($scope.countries[index].id == $scope.suppliers[entry].country) {
                        $scope.suppliers[entry].country = $scope.countries[index].name;
                        break;
                    }
                }
            }
        });
    });

    $scope.priorityOptions = [
        { name: 'Normal', value: 'Normal' },
        { name: 'High', value: 'High' },
        { name: 'Urgent', value: 'Urgent' }
    ];

    $scope.$watch('purchaseRequest', function (newValue, oldValue) {
        if (newValue != oldValue) {

            // PurchaseRequest.save($scope.purchaseRequest);

        }
    }, true);

    GLAccounts.query(function(data){
        $scope.gLAccounts = data;
    });

    $scope.$on('searchBroadcast', function() {
        flag = true;
    });

    $scope.$on('$locationChangeStart', function( event ) {
        if (flag) {
            $scope.draftPurchaseRequest();
        }
    });

    $scope.setLineItemSaveButtonLabel = function(data){
        if(data == 'EDIT'){
            $scope.saveButtonLabel = "Save Changes";
        }else{
            $scope.saveButtonLabel = "Save Item";
        }
    }
}

function CurrentRequestCtrl($scope, $rootScope) {
    $rootScope.$watch('currentRequest', function () {
        $scope.currentRequest = $rootScope.currentRequest;
    })
    
    $scope.showCurrentRequest = function () {
    	if($scope.currentRequest && $scope.currentRequest.status != 'REJECTED'
    		&& $scope.currentRequest.status != 'APPROVED' && $scope.currentRequest.status != 'CANCELLED') {
    		return true;
    	} else {
    		$rootScope.currentRequest = $scope.currentRequest =	undefined;
    		return false;
    	}
    }
    
}
function CurrentPurchaseOrderCtrl($scope, $rootScope) {
    $rootScope.$watch('currentPurchaseOrder', function () {
        $scope.currentPurchaseOrder = $rootScope.currentPurchaseOrder;
    })

    $scope.showCurrentPurchaseOrder = function () {
        if($scope.currentPurchaseOrder && $scope.currentPurchaseOrder.status != 'REJECTED'
            && $scope.currentPurchaseOrder.status != 'APPROVED' && $scope.currentPurchaseOrder.status != 'CANCELLED') {
            return true;
        } else {
            $rootScope.currentPurchaseOrder = $scope.currentPurchaseOrder =	undefined;
            return false;
        }
    }

}

function ProfileCtrl($scope, Profiles,$rootScope) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.master = $scope.profile = Profiles.query();

    $scope.update = function (profile) {
        $scope.master = angular.copy(profile);

        profile.$save(new function (data) {
            noty({text: "Your profile has been saved.", type: "warning"});

        });
    };

    $scope.reset = function () {
        $scope.profile = angular.copy($scope.master);
    };
}
//ProfileCtrl.$inject = ['$scope', 'Profiles'];

function PasswordCtrl($scope, Passwords) {
    $scope.master = $scope.oldNewPassword = {};

    $scope.change = function (oldNewPassword) {
        if (!$scope.validate(oldNewPassword)) {
            return;
        }

        Passwords.save(oldNewPassword,
            function (data, respHeader) {
                noty({text: "Your password has been updated.", type: "warning"});
                data.oldPassword = '';
                data.newPassword = '';
                data.newPasswordConfirm = '';
            }, function (data, respHeader) {
                if (data.status == 409) {
                    noty({text: "Please provide your current password.", type: "warning"});
                } else {
                    noty({text: "Internal system error: " + data.status, type: "warning"});
                }
                data.oldPassword = '';
                data.newPassword = '';
                data.newPasswordConfirm = '';
            });
    };

    $scope.validate = function (data) {
        var isValid = true;
        var message = "";

        if (angular.isDefined(data)) {
            if (angular.isUndefined(data.oldPassword) || data.oldPassword.length == 0) {
                isValid = false;
                message += "The old password can't be empty<br>";
            }
            if (angular.isUndefined(data.newPassword) || data.newPassword.length == 0) {
                isValid = false;
                message += "The new password can't be blank<br>";
            }
            if (angular.isDefined(data.newPassword) && (angular.isUndefined(data.newPasswordConfirm)
                || data.newPassword != data.newPasswordConfirm)) {
                isValid = false;
                message += "The new password and password confirmation does not match<br>";
            }
        } else {
            isValid = false;
            message += "Internal validation error";
        }

        if (!isValid) {
            noty({text: message, type: "error"});
        }

        return isValid;
    };
}

//PasswordCtrl.$inject = ['$scope', 'Password'];

function PurchaseTemplateCtrl($scope, $routeParams, $location, PurchaseTemplate, LineItem, ShippingAddress) {
    $scope.purchaseRequest = PurchaseTemplate.get({id: $routeParams.id});
    $scope.lineItems = LineItem.query({templateId: $routeParams.id});
    $scope.addresses = ShippingAddress.query();

    $scope.cancelPurchaseTemplate = function () {
        $location.path("/overview");
        noty({text: "Your purchase template has been cancelled.", type: "warning"});
    }

    $scope.saveLineItem = function (lineItem) {
    	lineItem.deliveryDate = new Date(moment(lineItem.deliveryDate));
    	lineItem.validityFrom = new Date(moment(lineItem.validityFrom));
        lineItem.validityTo = new Date(moment(lineItem.validityTo));
        if (typeof lineItem.templateId == 'undefined') {
            lineItem.templateId = $scope.purchaseTemplate.id;
            LineItem.create(lineItem, function (savedItem) {
                lineItem = savedItem;
                $scope.lineItems.push(lineItem);
            });
        } else {
            var category = getCategory(lineItem.category);
            if (angular.isDefined(category)) {
                lineItem.category = category.unspscCategory;
            }

            LineItem.save(lineItem, function (savedItem) {
                lineItem = savedItem;
            });
        }
        ;
        $scope.closeModal();
    };


    $scope.editLineItem = function (index) {
        $scope.lineItem = $scope.lineItems[index];

        $('#lineItemOverlay').modal('show');
    }

    $scope.deleteLineItem = function (index) {
        var deadLineItem = $scope.lineItems[index];
        if (confirm("Are you sure?")) {
            LineItem.destroy({id: deadLineItem.id}, function () {
                $scope.lineItems.splice(index, 1);
            });
        }
    };

    $scope.closeModal = function () {
        $scope.lineItem = undefined;
        $('.modal').modal('hide');
    };

    $scope.saveShippingAddress = function () {
        var address = ShippingAddress.create($scope.address);
        $scope.addresses.push(address);
        $scope.shippingAddress = address;
        $scope.closeModal();
    }
}

function ReportsCtrl($scope, $routeParams, $location, Reports,$rootScope) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.reports = {"reportId": 1, "status": "ALL", "timePeriod": 0, "days": 30};

    //$scope.reports.isDateRange  = $scope.reports.timePeriod==1;


    $scope.generateReport = function () {
        var reportsUrl = '/api/reports/' + $scope.reports.reportId + '?status=' + $scope.reports.status;
        if ($scope.reports.timePeriod == 0) {
//    		Reports.ordersByDays($scope.reports.reportId, $scope.reports.status, $scope.reports.days);
            reportsUrl = reportsUrl + '&days=' + $scope.reports.days;
        } else {
//    		Reports.ordersByDateRange($scope.reports.reportId, $scope.reports.status, $scope.reports.startDate, $scope.reports.endDate);
            reportsUrl = reportsUrl + '&startDate=' + $scope.reports.startDate + '&endDate=' + $scope.reports.endDate;
        }

        if ($scope.reports.timePeriod == 1 &&
            ($scope.reports.startDate == undefined || $scope.reports.endDate == undefined
                || $scope.reports.startDate == '' || $scope.reports.endDate == '')) {
            noty({text: "Please select valid date range.", type: "error"});
        } else {
            $scope.reportsUrl = reportsUrl;
            //	$location.path( reportUrl );
            document.getElementById('reportsUrl').href = reportsUrl;
            document.getElementById('reportsUrl').click();
        }

    };

    $scope.goBack = function () {
        $location.path("/overview");
    };
}
