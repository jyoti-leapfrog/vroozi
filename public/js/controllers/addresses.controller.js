'use strict';

//
// Address Controller
// @param $scope
// @param Addresses
// @param DefaultShippingAddress
// @param MessageService
//
function AddressCtrl ($scope, Addresses, Address, Countries, Regions, DefaultShippingAddress, DefaultCompanyAddress, MessageService,$rootScope) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    // retrieve all addresses
    $scope.loadingMessageAdd = true;
    $scope.noContentAdd = false;
    $scope.addresses = Address.query(function(){
        $scope.addresses.forEach(function(address){
            address.selected = false;

        });
        if($scope.addresses.length > 0){
            $scope.loadingMessageAdd = false;
        }
        if($scope.addresses.length == 0){
            $scope.loadingMessageAdd = false;
            $scope.noContentAdd = true;
        }
    });
    $scope.defaultShipping = DefaultShippingAddress.get();
    $scope.defaultCompanyAddress = DefaultCompanyAddress.get();
    $scope.address = {};

    // retrieve all countries
    $scope.countries = Countries.list();
    $scope.regions = Regions.list('US');

    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.noOfItems = 0;

    $scope.numberOfPages = function(){
        if($scope.noOfItems == -1 || $scope.noOfItems > 0)
            return Math.ceil($scope.noOfItems/$scope.pageSize);
        else if($scope.addresses)
            return Math.ceil($scope.addresses.length/$scope.pageSize);
    };

    // update default shipping address
    $scope.defaultShippingChange = function(selectedShippingAddressId) {
        DefaultShippingAddress.save({"id": selectedShippingAddressId},
            function (data, respHeader) {
                // success
                $scope.defaultShipping = data;
            }, function (data, respHeader) {
                noty({text: "System Error: " + data.status, type: "warning"});
            });
    };

    // update default company address
    $scope.defaultCompanyAddressChange = function(selectedCompanyAddressId) {
        DefaultCompanyAddress.save({"id": selectedCompanyAddressId},
            function (data, respHeader) {
                // success
                $scope.defaultCompanyAddress = data;
            }, function (data, respHeader) {
                noty({text: "System Error: " + data.status, type: "warning"});
            });
    };

    // edit address
    $scope.editAddress = function(address) {
        $scope.address = address;
        $('#addressOverlay').modal('show');
    };

    // delete address
    $scope.deleteAddress = function(address) {
        if (confirm("Are you sure?")) {
            Addresses.delete({'id': address.id},
                function (data, respHeader) {
                    // success
                    for(var i=0; i<$scope.addresses.length; i++) {
                        if($scope.addresses[i].id == address.id) {
                            $scope.addresses.splice(i, 1);
                            break;
                        }
                    }
                    if($scope.addresses.length == 0){
                        $scope.loadingMessageAdd = false;
                        $scope.noContentAdd = true;
                    }
                    noty({text: "Deleted address: " + address.addressName, type: "warning"});
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                }
            );
        }
    };

    $scope.saveShippingAddress = function() {
        var message = $scope.address;
        message.addressType = "shipping";

        if(angular.isDefined(message.id)) {
            // update address
            Addresses.update(message,
                function (data, respHeader) {
                    // success
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                });
        } else {
            // Create a new address
            message.active = true;
            Addresses.save(message,
                function (data, respHeader) {
                    // success
                    if($scope.noContentAdd){ // to remove 'no content' text if it was displaying.
                        $scope.noContentAdd = false;
                    }
                    $scope.addresses.push(data);
                    MessageService.publish('updateAddresses',data);
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                });
        }
        $scope.address = {};
        $scope.closeModal();
    };

    $scope.activateAddress = function(){
                $scope.addresses.forEach(function(address){
                        if(address.selected == true){
                                address.active = true;
                                Addresses.update(address,
                                function(){
                                    address.selected = false;
                                    //noty({text:"Address is been ACTIVATED"});
                                });
                            }
                    });
                $scope.confirmed = false;
            }

            $scope.deactivateAddress = function(){
                $scope.addresses.forEach(function(address){
                        if(address.selected == true){
                            address.active = false;

                            Addresses.update(address,
                            function(){
                                address.selected = false;
                            });


                            }
                    });
                $scope.confirmed = false;
            }

            $scope.checkAll = function(data){
                $scope.checkboxValue = data;
                $scope.addresses.forEach(function(address){
                    address.selected = $scope.checkboxValue;
                    });
            }

            $scope.setCheckAll = function(data){
                if(data == false){
                        $scope.confirmed = false;
                    }else{
                        $scope.confirmed = true;
                        $scope.addresses.forEach(function(address){
                                if(address.selected == false){
                                        $scope.confirmed = false;
                                    }
                            });
                    }
            }

    $scope.closeModal = function() {
        $scope.address = {};
        $('.modal').modal('hide');
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
}
//AddressCtrl.$inject = ['$scope'];
