function MaterialGroupCtrl ($scope, MaterialGroups, MessageService,$rootScope ){
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    //$scope.materialGroups = MaterialGroups.query();
    $scope.loadingMessageMat = true;
    $scope.noContentMat = false;
    $scope.materialGroups = MaterialGroups.query(function(){
        if($scope.materialGroups.length > 0){
            $scope.loadingMessageMat = false;
        }
        if($scope.materialGroups.length == 0){
            $scope.loadingMessageMat = false;
            $scope.noContentMat = true;
        }
    });

    $scope.$on('reloadMaterialgroups', function(event) {
        MaterialGroups.query(function(data){
            $scope.materialGroups = data;
            if($scope.materialGroups.length == 0){
                $scope.loadingMessageMat = false;
                $scope.noContentMat = true;
            }
        });
    })

    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.noOfItems = 0;

    $scope.numberOfPages = function(){
        if($scope.noOfItems == -1 || $scope.noOfItems > 0)
            return Math.ceil($scope.noOfItems/$scope.pageSize);
        else if($scope.gLAccounts)
            return Math.ceil($scope.gLAccounts.length/$scope.pageSize);
    };

    $scope.materialGroup = {};
    $scope.saveMaterialGroup = function(){
        if(angular.isDefined($scope.materialGroup.id)){
            MaterialGroups.save($scope.materialGroup, function(){
                MessageService.publish('reloadMaterialgroups');
                noty({text: "Material Group updated.", type: "warning"});
            });
        }else{
            MaterialGroups.create($scope.materialGroup, function(data){
                if($scope.noContentMat){ // to remove 'no content' text if it was displaying.
                    $scope.noContentMat = false;
                }
                $scope.materialGroups.push(data);
                noty({text: "New Material Group added.", type: "warning"});
            });
        }
        $scope.materialGroup = {};
        this.closeModal();
    }

    $scope.editMaterialGroup = function(materialGroup) {
        angular.copy(materialGroup, $scope.materialGroup);
        $('#materialGroupOverlay').modal('show');
        };

    $scope.materialGroups.forEach(function(mg){
       $scope.temp = mg;
    });

    $scope.deleteMaterialGroup = function(mg){
        if (confirm("Are you sure you want to delete the Mat Group?")){
            MaterialGroups.delete({id: mg.id});
            noty({text: "Mat Group " +mg.materialGroupCode+ " deleted.", type: "warning"});
            MessageService.publish('reloadMaterialgroups');
        }
    };

    $scope.closeModal = function() {
        $scope.materialGroup = {};
        $('.modal').modal('hide');

    };
}
