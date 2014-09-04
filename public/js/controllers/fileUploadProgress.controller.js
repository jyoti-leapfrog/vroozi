'use strict';

//
// Content Media Controller
// @param $scope
//
function FileUploadCtrl ($scope, MessageService) {
    $(":file").filestyle({classButton: "btn"});
    $scope.uploading = false;


    $scope.uploadComplete = function (content, completed) {

        if(! completed) {
            $scope.uploading = true;
        } else if(completed) {
            $scope.uploading = false;
            // if(completed && content.length > 0)
            // this never happens
            // this method is called multiple times
            // so we still have integration issues here
//            $(":file").filestyle('clear');
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
//
//        }
    };
}
