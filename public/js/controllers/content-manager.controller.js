'use strict';

function ContentManagerCtrl($scope, ContentManager, Suppliers, $q, SearchContent,$rootScope) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.items = [];
    $scope.item = {};
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.suppliers = {};
    $scope.suppliers.suppliersOptions = [];

    var defer = $q.defer();


//    var defPromise = ContentManager.query();
//
//    defPromise.then(function(data){$scope.items = data; return $scope.items;})
//        .then(function(){$scope.numberOfPages = Math.ceil($scope.items.length / $scope.pageSize);});

    $scope.loadingMessageItems = true;
    $scope.noContentItems = false;
    ContentManager.query(function(data) {
        $scope.items = data;
        $scope.numberOfPages = function () {
            return Math.ceil($scope.items.length / $scope.pageSize);
        }
        if($scope.items.length > 0){
            $scope.loadingMessageItems = false;
        }
        if($scope.items.length == 0){
            $scope.loadingMessageItems = false;
            $scope.noContentItems = true;
        }
    });


    $scope.suppliers.suppliersList = Suppliers.query('', function (data) {
        $scope.suppliers.suppliersList.forEach(function (supplier) {
            $scope.suppliers.suppliersOptions.push({ name: supplier.companyName, value: supplier.companyId });
        });
    });

//    $scope.numberOfPages = function(){
//        return Math.ceil($scope.items.length/$scope.pageSize);
//    };


//    $scope.closeModal = function() {
//
//        $scope.supplier = {};
//        $('.modal').modal('hide');
//    };
//
//    $scope.saveSupplier = function() {
////        $scope.supplier = this.supplier;
////        alert($scope.supplier.companyId);
//        if (typeof $scope.supplier.companyId == 'undefined') {
//            Suppliers.create($scope.supplier, function(savedSupplier) {
////                alert(savedSupplier.companyId);
//                for(var index in $scope.countries) {
//                    if  ($scope.countries[index].id == savedSupplier.country) {
//                        savedSupplier.country = $scope.countries[index].name;
//                        break;
//                    }
//                }
//                $scope.suppliers.push(savedSupplier);
//                $scope.closeModal();
//            }, function (data, respHeader) {
//                noty({text: "System Error: " + data.status, type: "warning"});
//            });
//        } else {
//            Suppliers.update($scope.supplier, function(updatedSupplier){
//
//                // success
//                for(var i=0; i<$scope.suppliers.length; i++) {
//                    if($scope.suppliers[i].companyId == updatedSupplier.companyId) {
//                        for(var index in $scope.countries) {
//                            if  ($scope.countries[index].id == updatedSupplier.country) {
//                                updatedSupplier.country = $scope.countries[index].name;
//                                break;
//                            }
//                        }
//                        $scope.suppliers[i] = updatedSupplier;
//                    }
//                }
//                $scope.closeModal();
//            }, function (data, respHeader) {
//                noty({text: "System Error: " + data.status, type: "warning"});
//            });
//
//        }
//    };
//
//    $scope.editSupplier = function(supplier) {
////        $scope.supplier = supplier;
//        angular.copy(supplier, $scope.supplier);
////        $scope.supplier = jQuery.extend(true, {}, supplier);
//        for(var index in $scope.countries) {
//            if  ($scope.countries[index].name == $scope.supplier.country) {
//                $scope.supplier.country = $scope.countries[index].id;
//                break;
//            }
//        }
//        $scope.supplier.country = parseInt($scope.supplier.country);
//        $('#supplierOverlay').modal('show');
//    }
//
    // delete product offer
    $scope.deleteProductOffer = function (productOffer) {

        if (confirm("Are you sure?")) {
          ContentManager.delete({'id': productOffer.itemId},
                    function (data, respHeader) {
                        // success
                        for (var i = 0; i < $scope.items.length; i++) {
                            if ($scope.items[i].itemId == productOffer.itemId) {
                                $scope.items.splice(i, 1);
                                break;
                            }
                        }

                        SearchContent.delete({'id': productOffer.itemId}, function (data, respHeader) {
                        });

                        noty({text: "Deleted product offer: " + productOffer.shortDescription, type: "warning"});
                    }, function (data, respHeader) {
                        noty({text: "System Error: " + data.status, type: "warning"});
                    }
                );
        }
    };
}