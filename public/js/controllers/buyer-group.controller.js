function BuyerGroupCtrl ($scope, BuyerGroupService,Users, Categories, Suppliers, CompanySettings,$rootScope) {

    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.numberOfPages = 1;
    $scope.noOfItems = 0;
    $scope.loadingMessageBG = true;
    $scope.noContentBG = false;
    $scope.buyerGroups = BuyerGroupService.query(function () {
        if($scope.buyerGroups.length > 0){
            $scope.loadingMessageBG = false;
        }
        if($scope.buyerGroups.length == 0){
            $scope.loadingMessageBG = false;
            $scope.noContentBG = true;
        }
        $scope.buyerGroups.forEach(function(group){
            group.selected = false
        });
        CompanySettings.query(function(data){
            $scope.companySettings = data;
            if($scope.companySettings.defaultBuyerGroupId){
                $scope.companyBuyerGroupId = $scope.companySettings.defaultBuyerGroupId;
            }else if($scope.buyerGroups.length > 0){
                $scope.companySettings.defaultBuyerGroupId = $scope.buyerGroups[0].id;
                CompanySettings.update($scope.companySettings,function(data){
                    $scope.companyBuyerGroupId = data.defaultBuyerGroupId;
                });
            }
        });
    });

    $scope.defaultBuyerGroup = function (buyerGroupId){
        if($scope.companySettings.id){
            $scope.companySettings.defaultBuyerGroupId = buyerGroupId;
            CompanySettings.update($scope.companySettings,function(data){
                noty({text: "Default buyer group added.", type: "warning"});
            });
        }
    }

    $scope.users = Users.query({roles:'buyer'});
    $scope.categories = Categories.list();
    $scope.suppliers = Suppliers.query();

    $scope.buyerGroup = {};
//    $scope.buyerGroupMembers = ["11", "13"];

    $scope.editBuyerGroup = function(group) {
        angular.copy(group, $scope.buyerGroup);
        $('#buyerGroupOverlay').modal('show');
    };

    $scope.numberOfPages = function(){
        if($scope.noOfItems == -1 || $scope.noOfItems > 0)
            return Math.ceil($scope.noOfItems/$scope.pageSize);
        else if($scope.buyerGroups)
            return Math.ceil($scope.buyerGroups.length/$scope.pageSize);
    };

    $scope.closeModal = function() {
        $scope.buyerGroup = {};
        $('.modal').modal('hide');

    };

    $scope.resetClassBuyerGroup = function(){
        $('#nameDiv').removeClass('error');
        $('#descriptionDiv').removeClass('error');
    }

    $scope.save = function(){
        if(angular.isDefined($scope.buyerGroup.id)){
            BuyerGroupService.update($scope.buyerGroup, function(updatedBuyerGroup) {
                for(var i=0; i<$scope.buyerGroups.length; i++) {
                    if($scope.buyerGroups[i].id == updatedBuyerGroup.id) {
                        $scope.buyerGroups[i] = updatedBuyerGroup;
                    }
                }
                noty({text: "Buyer group updated.", type: "warning"});
                $scope.closeModal();
            });
        }else{
            $scope.buyerGroup.active = true;
            BuyerGroupService.create($scope.buyerGroup, function(data) {
                if($scope.noContentBG){ // to remove 'no content' text if it was displaying.
                    $scope.noContentBG = false;
                }
                $scope.buyerGroups.push(data);
                noty({text: "New buyer group added.", type: "warning"});
                $scope.closeModal();
            });
        }

    };

    $scope.activateBuyer = function(){
        $scope.buyerGroups.forEach(function(group){
            if(group.selected == true){
                group.active = true;
                BuyerGroupService.update(group);
                group.selected = false ;
            }
        });
        $scope.confirmed = false;
    }

    $scope.deactivateBuyer = function(){
        $scope.buyerGroups.forEach(function(group){
            if(group.selected == true){
                group.active = false;
                BuyerGroupService.update(group);
                group.selected = false ;
            }
        });
        $scope.confirmed = false;
    }

    $scope.checkAll = function(data){
        $scope.checkboxValue = data;
        $scope.buyerGroups.forEach(function(group){
            group.selected = $scope.checkboxValue;
        });
    }

    $scope.setCheckAll = function(data){
        if(data == false){
            $scope.confirmed = false;
        }else{
            $scope.confirmed = true;
            $scope.buyerGroups.forEach(function(group){
            if(group.selected == false){
                $scope.confirmed = false;
            }
        });
        }
    }

    $scope.deleteBuyerGroup = function(groupId) {
        if (confirm("Are you sure?")) {
            BuyerGroupService.delete({'id': groupId},
                function (data, respHeader) {
                    // success
                    for(var i=0; i<$scope.buyerGroups.length; i++) {
                        if($scope.buyerGroups[i].id == groupId) {
                            $scope.buyerGroups.splice(i, 1);
                            break;
                        }
                    }
                    if($scope.buyerGroups.length == 0){
                        $scope.loadingMessageBG = false;
                        $scope.noContentBG = true;
                    }
                    noty({text: "Deleted buyer group: ", type: "warning"});
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                }
            );
        }
    };




}