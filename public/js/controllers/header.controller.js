'use strict';

//
// Logo Controller
// @param $scope
// @param MessageService
//
function LogoCtrl ($scope, $timeout, CompanySettings, MessageService,$rootScope,$location) {
    $scope.logoPath = 'images/1x1.png';

    var getCompanyLogo = function() {
        $('#imageLoadingOverlay').modal('hide');
        CompanySettings.query(function(item){
            if(item && item.companyIcon) {
                $scope.logoPath = 'icons/' + item.companyIcon;
            } else {
                $scope.logoPath = 'images/logo.png';
            }
        });
    };

    getCompanyLogo();

    $scope.$on('logo-update', function(event,data) {
        $timeout(function() {getCompanyLogo();}, 2000);
    });
    $scope.parentStatus = function (){
        $rootScope.lastClickByAdmin = 'myRequests';
        $rootScope.lastClickByApprover = 'myApprover';
        $location.path("/#");
    }
}
