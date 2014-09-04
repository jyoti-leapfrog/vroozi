'use strict';

function CostCenterCtrl ($scope, CostCenters, DefaultCostCenter,$rootScope) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.loadingMessageCost = true;
    $scope.noContentCost = false;
    $scope.costCenters = CostCenters.query(function() {
        var costCenterId = DefaultCostCenter.get(function() {
            $scope.costCenters.forEach(function(costCenter) {
                if(costCenter.id == costCenterId.id) {
                    $scope.selectedCostCenter = costCenter;
                }
                costCenter.selected = false;
            });
        });
        if($scope.costCenters.length > 0){
            $scope.loadingMessageCost = false;
        }
        if($scope.costCenters.length == 0){
            $scope.loadingMessageCost = false;
            $scope.noContentCost = true;
        }
    });

    $scope.costCenter = {};
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.noOfItems = 0;

    $scope.numberOfPages = function(){
        if($scope.noOfItems == -1 || $scope.noOfItems > 0)
            return Math.ceil($scope.noOfItems/$scope.pageSize);
        else if($scope.costCenters)
            return Math.ceil($scope.costCenters.length/$scope.pageSize);
    };

    $scope.saveCostCenter = function() {
        if(angular.isDefined($scope.costCenter.id)) {
            // update cost center
            CostCenters.update($scope.costCenter,
                function (data, respHeader) {
                    // success
                    for(var i=0; i<$scope.costCenters.length; i++) {
                        if($scope.costCenters[i].id == $scope.costCenter.id) {
                            $scope.costCenters[i] = $scope.costCenter;
                        }
                    }
                    $scope.costCenter = {};
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                });
        } else {
            // Create a new cost center
            $scope.costCenter.active = true;
            CostCenters.save($scope.costCenter,
                function (data, respHeader) {
                    // success
                    if($scope.noContentCost){ // to remove 'no content' text if it was displaying.
                        $scope.noContentCost = false;
                    }
                    $scope.costCenters.push(data);
                    $scope.costCenter = {};
                    noty({text: "New Cost Center added.", type: "warning"});
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                });
        }
        $scope.closeModal();
    };

    $scope.editCostCenter = function(item) {
        $scope.costCenter = item;
        $('#costCenterOverlay').modal('show');
    };

    // delete address
    $scope.deleteCostCenter = function(costCenter) {
        if (confirm("Are you sure?")) {
            CostCenters.delete({'id': costCenter.id},
                function (data, respHeader) {
                    // success
                    for(var i=0; i<$scope.costCenters.length; i++) {
                        if($scope.costCenters[i].id == costCenter.id) {
                            $scope.costCenters.splice(i, 1);
                            break;
                        }
                    }
                    if($scope.costCenters.length == 0){
                        $scope.loadingMessageCost = false;
                        $scope.noContentCost = true;
                    }
                    noty({text: "Deleted cost center: " + costCenter.name, type: "warning"});
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                }
            );
        }
    };

    // set default cost center
    $scope.defaultCostCenterChange = function(selectedCostCenter) {
        DefaultCostCenter.save({"id": $scope.selectedCostCenter.id},
            function (data, respHeader) {
                // success
            }, function (data, respHeader) {
                noty({text: "System Error: " + data.status, type: "warning"});
            });
    };

    $scope.activateCostCenter = function(){
        $scope.costCenters.forEach(function(costCenter){
            if(costCenter.selected == true){
                costCenter.active = true;
                CostCenters.update(costCenter,
                    function(){
                        costCenter.selected = false;
                    });
            }
        });
        $scope.confirmed = false;
    }

    $scope.deactivateCostCenter = function(){
        $scope.costCenters.forEach(function(costCenter){
            if(costCenter.selected == true){
                costCenter.active = false;
                CostCenters.update(costCenter,
                    function(){
                        costCenter.selected = false;
                    });


            }
        });
        $scope.confirmed = false;
    }

    $scope.checkAll = function(data){
        $scope.checkboxValue = data;
        $scope.costCenters.forEach(function(costCenter){
            costCenter.selected = $scope.checkboxValue;
        });
    }

    $scope.setCheckAll = function(data){
        if(data == false){
            $scope.confirmed = false;
        }else{
            $scope.confirmed = true;
            $scope.costCenters.forEach(function(costCenter){
                if(costCenter.selected == false){
                    $scope.confirmed = false;
                }
            });
        }
    }

    $scope.closeModal = function() {
        $scope.costCenter = {};
        $('.modal').modal('hide');
    };

    $scope.resetClassCostCenter = function(){
        $('#costCenterNameDiv').removeClass('error');
        $('#costCenterCodeDiv').removeClass('error');
    }
}

function GLAccounts ($scope, GLAccounts,MessageService) {
    $scope.loadingMessageGL = true;
    $scope.noContentGL = false;

    $scope.$on('reloadGLAccounts', function(event) {
        GLAccounts.query(function(data){
            $scope.gLAccounts = data;
            if($scope.gLAccounts.length == 0){
                $scope.loadingMessageGL = false;
                $scope.noContentGL = true;
            }
        });

    });

    GLAccounts.query(function(data) {
        $scope.gLAccounts = data;
        $scope.gLAccounts.forEach(function(gLAccount){
            gLAccount.selected  = false;
        });
        if($scope.gLAccounts.length > 0){
            $scope.loadingMessageGL = false;
        }
        if($scope.gLAccounts.length == 0){
            $scope.loadingMessageGL = false;
            $scope.noContentGL = true;
        }
    });

    $scope.gLAccount = {};
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.noOfItems = 0;

    $scope.numberOfPages = function(){
        if($scope.noOfItems == -1 || $scope.noOfItems > 0)
            return Math.ceil($scope.noOfItems/$scope.pageSize);
        else if($scope.gLAccounts)
            return Math.ceil($scope.gLAccounts.length/$scope.pageSize);
    };

    $scope.saveGLAccount = function() {
        if(angular.isDefined($scope.gLAccount.id)) {
            // update gLAccount
            GLAccounts.save($scope.gLAccount,
                function (data, respHeader) {
                    // success
                    MessageService.publish('reloadGLAccounts');
                    $scope.gLAccount = {};
                    noty({text: "GL Account updated.", type: "warning"});
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                });
        } else {
            // Create a new gl account
            GLAccounts.create($scope.gLAccount,
                function (data, respHeader) {
                    // success
                    if($scope.noContentGL){ // to remove 'no content' text if it was displaying.
                        $scope.noContentGL = false;
                    }
                    MessageService.publish('reloadGLAccounts');
//                    $scope.gLAccounts.push(data);
                    $scope.gLAccount = {};
                    noty({text: "New GL Account added.", type: "warning"});

                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                });
        }
        $scope.closeModal();
    };

    $scope.editGLAccount = function(item) {
        angular.copy(item, $scope.gLAccount);
        $('#glAccountsOverlay').modal('show');
    };

    // delete gLAccount
    $scope.deleteGLAccount = function(gLAccount) {
        if (confirm("Are you sure?")) {
            GLAccounts.delete({'id': gLAccount.id},
                function (data, respHeader) {
                    // success
                    MessageService.publish('reloadGLAccounts');
                    $scope.gLAccount = {};
                    noty({text: "Deleted GL Account: " + costCenter.name, type: "warning"});
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                }
            );
        }
    };

    $scope.activateGLAccount = function(){
        $scope.gLAccounts.forEach(function(gLAccount){
            if(gLAccount.selected == true){
                gLAccount.active = true;
                GLAccounts.save(gLAccount,
                    function(){
                        gLAccount.selected = false;
                    });
            }
        });
        $scope.confirmed = false;
    }

    $scope.deactivateGLAccount = function(){
        $scope.gLAccounts.forEach(function(gLAccount){
            if(gLAccount.selected == true){
                gLAccount.active = false;
                GLAccounts.save(gLAccount,
                    function(){
                        gLAccount.selected = false;
                    });


            }
        });
        $scope.confirmed = false;
    }

    $scope.checkAll = function(data){
        $scope.checkboxValue = data;
        $scope.gLAccounts.forEach(function(gLAccount){
            gLAccount.selected = $scope.checkboxValue;
        });
    }

    $scope.setCheckAll = function(data){
        if(data == false){
            $scope.confirmed = false;
        }else{
            $scope.confirmed = true;
            $scope.gLAccounts.forEach(function(gLAccount){
                if(gLAccount.selected == false){
                    $scope.confirmed = false;
                }
            });
        }
    }

    $scope.closeModal = function() {
        $scope.gLAccount = {};
        $('.modal').modal('hide');
    };

    $scope.resetClassGLAccounts = function(){
        $('#glAccountCodeDiv').removeClass('error');
        $('#glAccountDescriptionDiv').removeClass('error');
    }

}
//CostCenterCtrl.$inject = ['$scope', ''];

