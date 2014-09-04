'use strict';

//
// Content Media Controller
// @param $scope
//
function ControllerMediaCtrl ($scope, MessageService,$rootScope) {
    $(":file").filestyle({classButton: "btn"});
    $scope.uploading = false;

    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    $scope.uploadComplete = function (content, completed) {
        // notify the header
        if(! completed) {
            if($('#unitLogo').val().length > 0 ){
                $scope.uploading = true;
                $('#imageLoadingOverlay').modal({
                    backdrop: 'static',
                    keyboard: false
                },"show");
            }
        } else if(completed) {
            $scope.uploading = false;
            // if(completed && content.length > 0)
            // this never happens
            // this method is called multiple times
            // so we still have integration issues here
//            $(":file").filestyle('clear');
            MessageService.publish('logo-update', {});
        }

//        if (completed && content.length > 0) {
//            $scope.response = JSON.parse(content); // Presumed content is a json string!
//            $scope.response.style = {
//                color: $scope.response.color,
//                "font-weight": "bold"
//            };
//
//            // Clear form (reason for using the 'ng-model' directive on the input elements)
//            $scope.fullname = '';
//            $scope.gender = '';
//            $scope.color = '';
//            // Look for way to clear the input[type=file] element
//
//            // notify the header
//            MessageService.publish('logo-update', {});
//        }
    };
}
