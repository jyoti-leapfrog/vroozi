'use strict';
/* Controllers */

function OrganizationCtrl ($scope, Organization,CompanySettings,MessageService,$rootScope) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.myCompany   = CompanySettings.query();

    $scope.loadingMessageOrg = true;
    $scope.noContentOrg = false;
    $scope.associatedOrgs = Organization.query(function(data){
        if($scope.associatedOrgs.length > 0){
            $scope.loadingMessageOrg = false;
        }
        if($scope.associatedOrgs.length == 0){
            $scope.loadingMessageOrg = false;
            $scope.noContentOrg = true;
        }
    });

    $scope.$on('reloadAssociatedOrgs', function(event) {
        Organization.query(function(data){
            $scope.associatedOrgs = data;
            if($scope.associatedOrgs.length == 0){
                $scope.loadingMessageOrg = false;
                $scope.noContentOrg = true;
            }
        });
    });

    $scope.organization = {};
    $scope.associate = function(){
        if(angular.isDefined($scope.organization.id)){
            Organization.save($scope.organization, function() {
                MessageService.publish('reloadAssociatedOrgs');
                noty({text: "Organization association updated.", type: "warning"});
            });
        }else{
            Organization.create($scope.organization, function() {
                if($scope.noContentOrg){ // to remove 'no content' text if it was displaying.
                    $scope.noContentOrg = false;
                }
                MessageService.publish('reloadAssociatedOrgs');
                noty({text: "New organization association added.", type: "warning"});
            });
        }
        $scope.closeModal();
        $scope.organization = {};
    }

    $scope.deleteOrg = function(orgId){
        if (confirm("Are you sure you want to delete the Organization?")){
            Organization.delete({id: orgId}, function(data) {

            });
            MessageService.publish('reloadAssociatedOrgs');
            noty({text: "Organization association deleted.", type: "warning"});
        }


    }

    $scope.editOrg = function(org) {
        angular.copy(org,$scope.organization);
        $('#associateOverlay').modal('show');
    };

    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.noOfItems = 0;

    $scope.numberOfPages = function(){
        if($scope.noOfItems == -1 || $scope.noOfItems > 0)
            return Math.ceil($scope.noOfItems/$scope.pageSize);
        else if($scope.associatedOrgs)
            return Math.ceil($scope.associatedOrgs.length/$scope.pageSize);
    };

    $scope.closeModal = function() {
        $('#type').focus();
        $scope.organization = {};
        $('.modal').modal('hide');
    };

    $scope.resetClassOrganization = function(){
        $('#associatedCompanyNameDiv').removeClass('error');
        $('#associatedCompanyUserNameDiv').removeClass('error');
    }
}
function CompanyCodesCtrl ($scope, CompanyCodes, Address,MessageService, AssociatedCompanyCodes,$rootScope) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;

    $scope.loadingMessageCodes = true;
    $scope.noContentCodes = false;

    CompanyCodes.query(function(data){
        $scope.companyCodes = data;

        if($scope.companyCodes.length > 0){
            $scope.loadingMessageCodes = false;
        }
        if($scope.companyCodes.length == 0){
            $scope.loadingMessageCodes = false;
            $scope.noContentCodes = true;
        }

        $scope.companyCodes.forEach(function(companyCode){
            companyCode.selected = false;
        });
    });
    $scope.addresses = [];
    Address.query(function(data){
        data.forEach(function(address){
            if(address.companyAddress){
                $scope.addresses.push(address);
            }
        });
    });

    $scope.$on('reloadCompanyCodes', function(event) {
        CompanyCodes.query(function(data){
            $scope.companyCodes = data;
            if($scope.companyCodes.length == 0){
                $scope.loadingMessageCodes = false;
                $scope.noContentCodes = true;
            }
        });
    });

    $scope.companyCode = {};
    $scope.associateCompanyCode = function(){
        if(angular.isDefined($scope.companyCode.id)){
            CompanyCodes.save($scope.companyCode, function() {
                MessageService.publish('reloadCompanyCodes');
                noty({text: "Company Code updated.", type: "warning"});
            });
        }else{
            CompanyCodes.create($scope.companyCode, function(data) {
//                MessageService.publish('reloadCompanyCodes');
                if($scope.noContentCodes){ // to remove 'no content' text if it was displaying.
                    $scope.noContentCodes = false;
                }
                $scope.companyCodes.push(data);
                noty({text: "New Company Code added.", type: "warning"});
            });
        }
        $scope.companyCode = {};
        $scope.closeModal();

    }

    $scope.deleteCompanyCode = function(orgId,companyCode){
        if (confirm("Are you sure you want to delete the Company Code?")){
            AssociatedCompanyCodes.delete({id: orgId}, function(data) {
                if(data.deleted){
                    MessageService.publish('reloadCompanyCodes');
                    noty({text: "Company Code deleted.", type: "warning"});
                }else{
                    noty({text: "Company Code is associated with Purchase Order, it cannot be deleted", type: "warning"});
                }

            });
        }
    }

    $scope.editCompanyCode = function(company) {
        angular.copy(company, $scope.companyCode);
        $('#associateCompanyCode').modal('show');
    };

    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.noOfItems = 0;

    $scope.numberOfPages = function(){
        if($scope.noOfItems == -1 || $scope.noOfItems > 0)
            return Math.ceil($scope.noOfItems/$scope.pageSize);
        else if($scope.companyCodes)
            return Math.ceil($scope.companyCodes.length/$scope.pageSize);
    };

    $scope.activateCompanyCode = function(){
        $scope.companyCodes.forEach(function(companyCode){
            if(companyCode.selected == true){
                companyCode.active = true;
                CompanyCodes.save(companyCode,
                    function(){
                        companyCode.selected = false;
                    });
            }
        });
        $scope.confirmed = false;
    }

    $scope.deactivateCompanyCode = function(){
        $scope.companyCodes.forEach(function(companyCode){
            if(companyCode.selected == true){
                companyCode.active = false;
                CompanyCodes.save(companyCode,
                    function(){
                        companyCode.selected = false;
                    });


            }
        });
        $scope.confirmed = false;
    }

    $scope.checkAll = function(data){
        $scope.checkboxValue = data;
        $scope.companyCodes.forEach(function(companyCode){
            companyCode.selected = $scope.checkboxValue;
        });
    }

    $scope.setCheckAll = function(data){
        if(data == false){
            $scope.confirmed = false;
        }else{
            $scope.confirmed = true;
            $scope.companyCodes.forEach(function(companyCode){
                if(companyCode.selected == false){
                    $scope.confirmed = false;
                }
            });
        }
    }

    $scope.closeModal = function() {
        $scope.companyCode = {}
        $('.modal').modal('hide');
    };

    $scope.resetClassCompanyCode = function(){
        $('#companyCodeDiv').removeClass('error');
        $('#companyCodeDescriptionDiv').removeClass('error');
        $('#companyAddressDiv').removeClass('error');
    }
}

//OrganizationCtrl.$inject = ['$scope', 'Organization'];

