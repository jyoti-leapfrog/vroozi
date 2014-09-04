'use strict';

function SuppliersCtrl ($scope, Suppliers, CountriesList, Regions, PaymentTerms, Profiles,$rootScope) {
    $(":file").filestyle({classButton: "btn"});
    $scope.uploading = false;
    $scope.paymentTermsObject = {};
    $scope.paymentTermsObject.paymentTermOption = [];
    $scope.editSupplierCase = false;

    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;

    $scope.paymentTermsObject.paymentTermsList = PaymentTerms.query('', function (data) {
        $scope.paymentTermsObject.paymentTermsList.forEach(function (paymentTerm) {
            $scope.paymentTermsObject.paymentTermOption.push({ name: paymentTerm.paymentTermDescription, value: paymentTerm.paymentTermId });
        });
    });

    $scope.login = Profiles.query(function (data) {
        $scope.logedInUserDetails = data;
        var PManRoles = $scope.logedInUserDetails.rolesPerApp.purchaseManagerRoles;
        PManRoles.forEach(function(role){
            if(role == 'Buyer'){
                $scope.buyerLoggedIn = true;
            }
        });
    });

    $scope.loadingMessageSup = true;
    $scope.noContentSup = false;
    $scope.suppliers = Suppliers.query(function(supplierData) {
        // retrieve all countries
        $scope.countries = CountriesList.query(function(data){
            for(var entry in $scope.suppliers) {
                    for(var index in $scope.countries) {
//                        alert('list:'+$scope.countries[index].id);
//                        alert('supplier:'+entry.country);
                        if  ($scope.countries[index].id == $scope.suppliers[entry].country) {
                            $scope.suppliers[entry].country = $scope.countries[index].name;
                            break;
                        }
                    }

            }
        });
        if($scope.suppliers.length > 0){
            $scope.loadingMessageSup = false;
        }
        if($scope.suppliers.length == 0){
            $scope.loadingMessageSup = false;
            $scope.noContentSup = true;
        }
    });

    $scope.regions = Regions.list('US');

    $scope.supplier = {};
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.numberOfPages = function(){
        return Math.ceil($scope.suppliers.length/$scope.pageSize);
    };

    $scope.openSupplierLogoModal = function(companyId) {
        $(":file").filestyle({classInput: "input-small"});
        $scope.selectedCompanyId = companyId;
        $scope.uploading = false;
    };

    $scope.closeModal = function() {
        $scope.supplier = {};
        $scope.supplierName = undefined;
        $('.modal').modal('hide');
    };

    $scope.resetClassSupplier = function(){
        $('#nameDiv').removeClass('error');
        $('#countryDiv').removeClass('error');
        $('#streetDiv').removeClass('error');
        $('#cityDiv').removeClass('error');
        $('#zipDiv').removeClass('error');
    }

    $scope.saveSupplier = function() {
        //        alert($scope.supplier.paymentTerms);
//        $scope.supplier.paymentTerms = $scope.paymentTerms;
//        alert($scope.supplier.companyId);
        if (typeof $scope.supplier.companyId == 'undefined') {
            $scope.supplier.includeSupplierCard = 'true';
            $scope.supplier.disableBrowse = 'false';
            if(typeof $scope.supplier.defaultVendorId == 'undefined' || $scope.supplier.defaultVendorId == '' || $scope.supplier.defaultVendorId == null){
                $scope.supplier.defaultVendorId = $scope.supplier.companyName;
            }
            $scope.supplier.minOrder = '0.00';
            $scope.supplier.punchOut = 'false';
            $scope.supplier.active = 'true';
            $scope.supplier.createdBy = $scope.logedInUserDetails.email;
            $scope.supplier.currencyCode = 'USD';
            $scope.supplier.dateFormat = $scope.logedInUserDetails.dateFormat;
            $scope.supplier.decimalNotation = $scope.logedInUserDetails.decimalNotation;
            $scope.supplier.timeZone = $scope.logedInUserDetails.timeZone;
            $scope.supplier.supplierAttributePairs = [];

            Suppliers.create($scope.supplier, function(savedSupplier) {
//                alert(savedSupplier.companyId);
                for(var index in $scope.countries) {
                    if  ($scope.countries[index].id == savedSupplier.country) {
                        savedSupplier.country = $scope.countries[index].name;
                        break;
                    }
                }
                $scope.suppliers.push(savedSupplier);
                $scope.closeModal();
            }, function (data, respHeader) {
                noty({text: "System Error: " + data.status, type: "warning"});
            });
        } else {
            if(typeof $scope.supplier.defaultVendorId == 'undefined' || $scope.supplier.defaultVendorId == '' || $scope.supplier.defaultVendorId == null){
                $scope.supplier.defaultVendorId = $scope.supplier.companyName;
            }
            Suppliers.update($scope.supplier, function(updatedSupplier){

                // success
                for(var i=0; i<$scope.suppliers.length; i++) {
                    if($scope.suppliers[i].companyId == updatedSupplier.companyId) {
                        for(var index in $scope.countries) {
                            if  ($scope.countries[index].id == updatedSupplier.country) {
                                updatedSupplier.country = $scope.countries[index].name;
                                break;
                            }
                        }
                        $scope.suppliers[i] = updatedSupplier;
                    }
                }
                $scope.closeModal();
            }, function (data, respHeader) {
                noty({text: "System Error: " + data.status, type: "warning"});
            });

        }
    };

    $scope.editSupplier = function(supplier) {
        $scope.editSupplierCase = true;
        $scope.supplierName = supplier.companyName;
        angular.copy(supplier, $scope.supplier);
//        $scope.supplier = jQuery.extend(true, {}, supplier);
        for(var index in $scope.countries) {
            if  ($scope.countries[index].name == $scope.supplier.country) {
                $scope.supplier.country = $scope.countries[index].id;
                break;
            }
        }
        $scope.supplier.country = parseInt($scope.supplier.country);
        $('#supplierOverlay').modal('show');
    }

    // delete supplier
    $scope.deleteSupplier = function(supplier) {
        if (confirm("Are you sure?")) {
            Suppliers.delete({'id': supplier.companyId},
                function (data, respHeader) {
                    // success
                    for(var i=0; i<$scope.suppliers.length; i++) {
                        if($scope.suppliers[i].companyId == supplier.companyId) {
                            $scope.suppliers.splice(i, 1);
                            break;
                        }
                    }

                    noty({text: "Deleted supplier: " + supplier.companyName, type: "warning"});
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                }
            );
        }
    };

    $scope.supplierLogoFormHandler = function(contents, completed) {
        // notify the header
        if(! completed) {
            $scope.uploading = true;
        } else if(completed) {
            $scope.uploading = false;
            // if(completed && content.length > 0)
            // this never happens
            // this method is called multiple times
            // so we still have integration issues here
//            $(":file").filestyle('clear');
//            MessageService.publish('logo-update', {});
        }
    }

    $scope.validateByName = function(){
        if($scope.supplier.companyName != null && $scope.supplier.companyName && $scope.supplier.companyName != $scope.supplierName){
            Suppliers.query({'suppliername':$scope.supplier.companyName},function(data){
                if(data.length > 0 && data){
                    noty({text: "Supplier already exists", type: "warning"});
                    $scope.supplier.companyName = null;
                }
        });
        }
    }
}