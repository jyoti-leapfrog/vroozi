'use strict';

function UserCtrl ($scope, Users, UserRoles, Profiles, ResetEmail,$location,$rootScope) {
    $rootScope.currentRequest = undefined;
    $rootScope.currentPurchaseOrder = undefined;
    Profiles.query(function(data){
        $scope.loginUserEmail = data.email;
        $scope.loginUserName = data.username;
        $scope.loadingMessage = true;
        $scope.noContent = false;
            $scope.users = Users.query({includeSelf:true},
            // success callback
            function (data) {
            $scope.users.forEach(function(user) {
                user.isLoggedIn = false;
                if(user.username == $scope.loginUserName){
                    user.isLoggedIn = true;
                }
                var string = "";
                if(null != user.rolesPerApp && user.rolesPerApp.purchaseManagerRoles.length > 0){
                    for(var i=0; i<user.rolesPerApp.purchaseManagerRoles.length; i++) {
                        string = string.concat(user.rolesPerApp.purchaseManagerRoles[i]).concat(',');
                    }
                }
                user.rolesAssigned = string.slice(0,string.length-1);
                user.selected = false;
                if(user.active == true) {
                    user.active = "Active";
                } else {
                    user.active = "Inactive";
                }
                if(user.lastLogin) {
                    //from start last login has been created as a string, to avoid showing hours,mins and seconds this step is performed
                    user.lastLogin = user.lastLogin.substr(0, 10).split('-').join('/');
                }
            });
                if($scope.users.length > 0){
                    $scope.loadingMessage = false;
                }
                if($scope.users.length == 0){
                    $scope.loadingMessage = false;
                    $scope.noContent = true;
                }
        });
    });
    var USERNAME_REGEX =          /^([a-zA-Z0-9])+([a-zA-Z0-9\-])+$/;
    $scope.blurCallback = function() {
        if(!$scope.user.emailAsUsername && typeof $scope.user.username != undefined && $scope.user.username){
            if(!USERNAME_REGEX.test($scope.user.username)){
                noty({text: "Username may only contain alphanumeric characters or dashes and cannot begin with a dash.", timeout:2500, type: "warning"});
                $scope.user.username = '';
            }
        }

        if (typeof $scope.user.username != undefined && $scope.user.username) {
            Users.query({username:$scope.user.username},
                function (data) {
                    if (data[0].username != undefined) {
//                    alert(data[0].username);
                        alert('Username already exists. Please select a different username.');
                        $scope.user.username = '';
                    }

                });
        }
    };

    var EMAIL_REGEX =          /^[a-zA-Z0-9,!#\$%&'\*\+/=\?\^_`\{\|}~-]+(\.[a-zA-Z0-9,!#\$%&'\*\+/=\?\^_`\{\|}~-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.([a-z]{2,})$/;
    $scope.blurEmailCallback = function() {
        var flag = true;
        if(!EMAIL_REGEX.test($scope.user.email)){
            flag = false;
            noty({text: "Email Address is not valid.", timeout:2500, type: "warning"});
            $scope.user.username = '';
            $('#emailDiv').addClass('error');
        }else{
            $('#emailDiv').removeClass('error');
        }
        //check to see if this email is already taken in both collections (user, user_registration)---FALC-475
        if (flag && typeof $scope.user.email != undefined && $scope.user.email) {
            Users.find({emailToValidate:$scope.user.email},function(data){
                if(data.email != undefined){
                    $scope.user.email = '';
                    noty({text: "The specified email is already being used.", timeout:2500, type: "warning"});
                }
            });
        }
    };

    $scope.approverUsers = [];
    $scope.approverUsersOptions = [];
    $scope.approverUsers = Users.query({roles:'approver'},
    		function (data) {
    	// success callback
    	$scope.approverUsers.forEach(function(user) {
    		$scope.approverUsersOptions.push({ name: user.firstName  + ' ' + user.lastName, value: user.userId });
    	});
    });

    $scope.user = {};
    
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.noOfItems = 0;

    $scope.numberOfPages = function(){
        if($scope.noOfItems == -1 || $scope.noOfItems > 0)
            return Math.ceil($scope.noOfItems/$scope.pageSize);
        else if($scope.users)
            return Math.ceil($scope.users.length/$scope.pageSize);
    };

    $scope.saveUser = function() {
//        alert($scope.user.userId);

        if(angular.isDefined($scope.user.userId)) {
            // update user
            $scope.user.rolesPerApp = {};
            var roles = [];
            if (angular.isDefined($scope.user.employeeRole) && $scope.user.employeeRole) {
                roles.push('Employee');
            }
            if (angular.isDefined($scope.user.approverRole) && $scope.user.approverRole) {
                roles.push('Approver');
            }
            if (angular.isDefined($scope.user.buyerRole) && $scope.user.buyerRole) {
                roles.push('Buyer');
            }
            if (angular.isDefined($scope.user.supplierRole) && $scope.user.supplierRole) {
                roles.push('Supplier');
            }
            if (angular.isDefined($scope.user.adminRole) && $scope.user.adminRole) {
                roles.push('Admin');
            }


            // These properties need to be removed before calling service since POJO doesn't have these
            $scope.user.employeeRole = undefined;
            $scope.user.approverRole = undefined;
            delete $scope.user.buyerRole;
            delete $scope.user.supplierRole;
            $scope.user.adminRole = undefined;
            $scope.user.rolesAssigned = undefined;
            $scope.user.isLoggedIn = undefined;

            $scope.user.rolesPerApp.purchaseManagerRoles = roles;
            $scope.user.active = "Active" == $scope.user.active;
            Users.update($scope.user,
                function (data, respHeader) {
                    // success
                    for(var i=0; i<$scope.users.length; i++) {
                        if($scope.users[i].userId == $scope.user.userId) {
                            var string = "";
                            if($scope.user.rolesPerApp && $scope.user.rolesPerApp.purchaseManagerRoles.length > 0){
                                for(var j=0; j<$scope.user.rolesPerApp.purchaseManagerRoles.length; j++) {
                                    string = string.concat($scope.user.rolesPerApp.purchaseManagerRoles[j]).concat(',');
                                }
                            }
                            $scope.user.rolesAssigned = string.slice(0,string.length-1);
                            if ($scope.user.active == true) {
                                $scope.user.active = "Active";
                            } else {
                                $scope.user.active = "Inactive";
                            }
                            $scope.users[i] = $scope.user;
                        }
                    }
                    $scope.user = {};
                    $scope.closeModal();
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                });
        } else {

            // Create a new user
            $scope.user.active=true;
            $scope.user.rolesPerApp = {};
            var roles = [];
            var set = false;
            if (angular.isDefined($scope.user.employeeRole) && $scope.user.employeeRole) {
                roles.push('Employee');
                set = true;
            }
            if (angular.isDefined($scope.user.approverRole) && $scope.user.approverRole) {
                roles.push('Approver');
                set = true;
            }
            if (angular.isDefined($scope.user.buyerRole) && $scope.user.buyerRole) {
                roles.push('Buyer');
                set = true;
            }
            if (angular.isDefined($scope.user.adminRole) && $scope.user.adminRole) {
                roles.push('Admin');
                set = true;
            }
            if (angular.isDefined($scope.user.supplierRole) && $scope.user.supplierRole) {
                roles.push('Supplier');
                set = true;
            }
            //remove added properties as they are not available in POJO used by Java service
            $scope.user.employeeRole = undefined;
            $scope.user.approverRole = undefined;
            delete $scope.user.buyerRole;
            delete $scope.user.supplierRole;
            $scope.user.adminRole = undefined;

            if (!set) {
                $scope.user.rolesPerApp = undefined;
            } else {
                $scope.user.rolesPerApp.purchaseManagerRoles = roles;
                set = false;
            }

            Users.save($scope.user,
                function (data, respHeader) {
                    // success
                    $scope.user.userId = data.userId;
                    $scope.user.active="Active";
                    var string = "";
                    if(null != $scope.user.rolesPerApp && $scope.user.rolesPerApp.purchaseManagerRoles.length > 0){
                        for(var i=0; i<$scope.user.rolesPerApp.purchaseManagerRoles.length; i++) {
                            string = string.concat($scope.user.rolesPerApp.purchaseManagerRoles[i]).concat(',');
                        }
                    }
                    $scope.user.rolesAssigned = string.slice(0,string.length-1);

                    $scope.users.push($scope.user);
                    $scope.user = {};
                    $scope.closeModal();
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                });
        }
    };

    $scope.activateUser = function(){
        $scope.users.forEach(function(user){
            if(user.selected == true){
                user.active = true;
                $scope.tempRolesAssigned = user.rolesAssigned;
                $scope.tempIsLoggedIn = user.isLoggedIn;
                user.rolesAssigned = undefined;
                user.isLoggedIn = undefined;

                Users.update(user);
                user.isLoggedIn = $scope.tempIsLoggedIn;
                delete $scope.tempIsLoggedIn;
                user.rolesAssigned = $scope.tempRolesAssigned;
                delete $scope.tempRolesAssigned;
                user.active = "Active";
                user.selected = false;
            }
        });
        $scope.confirmed = false;
    }

    $scope.deactivateUser = function(){
        $scope.users.forEach(function(user){
            if(user.selected == true){
                user.active = false;
                $scope.tempRolesAssigned = user.rolesAssigned;
                $scope.tempIsLoggedIn = user.isLoggedIn;
                user.rolesAssigned = undefined;
                user.isLoggedIn = undefined;

                Users.update(user);
                user.rolesAssigned = $scope.tempRolesAssigned;
                delete $scope.tempRolesAssigned;
                user.isLoggedIn = $scope.tempIsLoggedIn;
                delete $scope.tempIsLoggedIn;
                user.active = "Inactive";
                user.selected = false;
            }
        });
        $scope.confirmed = false;
    }

    $scope.checkAll = function(data){
        $scope.checkboxValue = data;
        $scope.users.forEach(function(user){
            user.isLoggedIn = false;
            if(user.username == $scope.loginUserName){
                user.isLoggedIn = true;
                user.selected = false;
            }else{
                user.selected = $scope.checkboxValue;
            }
        });
    }

    $scope.setCheckAll = function(data){
        if(data == false){
            $scope.confirmed = false;
        }else{
            $scope.confirmed = true;
            $scope.users.forEach(function(user){
                if(user.selected == false){
                    $scope.confirmed = false;
                }
            });
        }
    }

    $scope.resetPasswordEmail = function(user){
        if(user.active == "Active") {
            user.active = true;
        } else {
            user.active = false;
        }
        //user.active = true;
        user.resetPassword = true;

        //Saving user roles temp.
        $scope.tempRolesAssigned = user.rolesAssigned;
        $scope.tempEmployeeRole = $scope.user.employeeRole;
        $scope.tempApproverRole = $scope.user.approverRole;
        $scope.tempBuyerRole = $scope.user.buyerRole;
        $scope.tempSupplierRole = $scope.user.supplierRole;
        $scope.tempAdminRole = $scope.user.adminRole;

        //These properties need to be removed before calling service since POJO doesn't have these
        user.rolesAssigned = undefined;
        $scope.user.isLoggedIn = undefined;
        $scope.user.employeeRole = undefined;
        $scope.user.approverRole = undefined;
        $scope.user.buyerRole = undefined;
        $scope.user.supplierRole = undefined;
        $scope.user.adminRole = undefined;

        ResetEmail.update(user,
            function(data, respHeader){
                if(user.active == true) {
                    user.active = "Active";
                } else {
                    user.active = "Inactive";
                }
                noty({text: "Reset password email send to: " + user.username, timeout:2500, type: "warning"});
        }, function(data, respHeader){
                noty({text: "Error sending email: " + data.status, timeout:2500, type: "warning"});
            });


        //Moving User roles from temp to "user"
        user.rolesAssigned = $scope.tempRolesAssigned;
        $scope.user.employeeRole = $scope.tempEmployeeRole;
        $scope.user.approverRole =$scope.tempApproverRole;
        $scope.user.buyerRole = $scope.tempBuyerRole;
        $scope.user.supplierRole = $scope.tempSupplierRole;
        $scope.user.adminRole = $scope.tempAdminRole;

        //Destroying un-used variables
        delete $scope.tempRolesAssigned ;
        delete $scope.tempEmployeeRole ;
        delete $scope.tempApproverRole ;
        delete $scope.tempBuyerRole ;
        delete $scope.tempSupplierRole ;
        delete $scope.tempAdminRole ;
    }

    $scope.setValues = function(){
        $scope.showResetLink = false;
    }

    $scope.editUser = function(item) {
        item.isLoggedIn = false;
        if(item.username == $scope.loginUserName){
            item.isLoggedIn = true;
            $location.path("/profile");
        }else{
            $scope.user = item;
            $scope.showResetLink = true;
            $scope.isReadOnlyRequest = angular.isDefined(item.userId);
            if (angular.isDefined(item.rolesPerApp) && item.rolesPerApp && angular.isDefined(item.rolesPerApp.purchaseManagerRoles) && item.rolesPerApp.purchaseManagerRoles) {
                $scope.user.employeeRole = (item.rolesPerApp.purchaseManagerRoles.indexOf('Employee') > -1);
                $scope.user.approverRole = (item.rolesPerApp.purchaseManagerRoles.indexOf('Approver') > -1);
                $scope.user.buyerRole = (item.rolesPerApp.purchaseManagerRoles.indexOf('Buyer') > -1);
                $scope.user.supplierRole = (item.rolesPerApp.purchaseManagerRoles.indexOf('Supplier') > -1);
                $scope.user.adminRole = (item.rolesPerApp.purchaseManagerRoles.indexOf('Admin') > -1);
            }
            $('#userOverlay').modal('show');
        }
    };

    // delete user
    $scope.deleteUser = function(user) {
        if (confirm("Are you sure?")) {
            Users.delete({'id': user.userId},
                function (data, respHeader) {
                    // success
                    for(var i=0; i<$scope.users.length; i++) {
                        if($scope.users[i].userId == user.userId) {
                            $scope.users.splice(i, 1);
                            break;
                        }
                    }

                    noty({text: "Deleted user: " + user.username, type: "warning"});
                }, function (data, respHeader) {
                    noty({text: "System Error: " + data.status, type: "warning"});
                }
            );
        }
    };
    
    $scope.useEmailAsUsername = function() {
    	if($scope.user.emailAsUsername) {
            Users.query({username:$scope.user.email},
                function (data) {
                    if (data.id != undefined) {
//                    alert(data[0].username);
                        alert('The username you entered already exists. Please enter a different username.');
                        $scope.user.username = '';
                        $scope.user.emailAsUsername = false;
                    } else {
                        $scope.user.username = $scope.user.email;
                    }

                });
    	}
    };
    $scope.closeModal = function() {
        $scope.user = {};
        $scope.isReadOnlyRequest = false;
        $('.modal').modal('hide');
    };

    $scope.resetClass = function(){
        $('#emailDiv').removeClass('error');
        $('#usernameDiv').removeClass('error');
        $('#firstNameDiv').removeClass('error');
        $('#lastNameDiv').removeClass('error');
    }
}

