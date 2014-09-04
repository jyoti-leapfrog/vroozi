'use strict';

/* Filters */
//PMan.filter('moment', function() {
//    return function(dateString, format) {
//        return moment(dateString).format(format);
//    };
//});

// sample use {{ value | currency:"USD" }}
PMan.filter('currency', function() {
    return function(number, currencyCode) {
      var currency = {
        USD: "$",
        PKR: "₨",
        INR: "₹",
        THB: "฿",
        CNY: "¥",
        GBP: "£",
        AUD: "$",
        EUR: "€",
        CAD: "$",
        MIXED: "~"


      },
      thousand, decimal, format;
      if ($.inArray(currencyCode, ["USD", "AUD", "CAD","PKR","INR","THB","CNY", "MIXED"]) >= 0) {
        thousand = ",";
        decimal = ".";
        format = "%s%v";
      } else {
        thousand = ".";
        decimal = ",";
        format = "%s%v";
      };
      return accounting.formatMoney(number, currency[currencyCode], 2, thousand, decimal, format);
    };
  });

PMan.filter('priceFormat', function() {
    return function(number, currencyCode) {
        var thousand, decimal, format;
        if ($.inArray(currencyCode, ["USD", "AUD", "CAD","PKR","INR","THB","CNY", "MIXED"]) >= 0) {
            thousand = ",";
            decimal = ".";
            format = "%s%v";
        } else {
            thousand = ".";
            decimal = ",";
            format = "%s%v";
        };
        return accounting.formatMoney(number, '', 2, thousand, decimal, format);
    };
});

PMan.filter('formatOrder', function() {
        return function(input) {
            var out = "";
            if(typeof input === 'undefined'){
                 // if no value don't execute.
            }else{
                for (var i = 0; i < input.length; i++) {
                    if(i != 0 && i%4 == 0){
                        out +='-'
                    }
                    out += input.charAt(i);
                }
            }
            return out;
        }
    });

PMan.filter('firstLetter', function() {
    return function(input) {
        if(typeof input == 'undefined') {
            return "";
        }
        input = input.trim();

        if(input.length == 0) {
            return "";
        } else {
            return input.charAt(0);
        }
    }
});

PMan.filter('initialUppercase', function() {
    return function(input) {
        if(typeof input == 'undefined') {
            return "";
        }
        input = input.trim();

        if(input.length == 0) {
            return "";
        }

        var out = "";
        out += input.charAt(0);
        if(input.length > 1) {
            out += input.substr(1).toLowerCase();
        }
        return out;
    }
});

PMan.filter('changeStatus', function() {
    return function(input) {
        var out = "";
        if(typeof input === 'undefined'){
            // if no value don't execute.
        }else{
            if(input =="NEW"){
                out = "DRAFT";
            }else{
                out = input;
            }
        }
        return out;
    }
});
angular.module('filters', []).
    filter('currency', function () {
        return function (number, currencyCode) {
            var currency = {
                    USD: "$",
                    GBP: "£",
                    AUD: "$",
                    EUR: "€",
                    CAD: "$",
                    MIXED: "~"
                },
                thousand, decimal, format;
            if ($.inArray(currencyCode, ["USD", "AUD", "CAD", "MIXED"]) >= 0) {
                thousand = ",";
                decimal = ".";
                format = "%s%v";
            } else {
                thousand = ".";
                decimal = ",";
                format = "%s%v";
            }
            return accounting.formatMoney(number, currency[currencyCode], 2, thousand, decimal, format);
        };
    });

PMan.filter('phonenumber', function() {
    return function (phoneNumber, locale) {
        if(angular.isUndefined(phoneNumber) || !phoneNumber) {
            return phoneNumber;
        }
        phoneNumber = phoneNumber.trim();
        if(phoneNumber.length < 10) {
            return phoneNumber;
        }

        // strip
        var stripped = '';
        phoneNumber.split('').forEach(function(ch) {
            // if a number add to stripped
            if(isNumber(ch)) {
                stripped += ch;
            }
        });
        if(stripped.length != 10) {
            return phoneNumber;
        }

        // format
        var pos = 0;
        var numberStr = '';
        stripped.split('').forEach(function(ch) {
            pos++;

            switch(pos) {
                case 1:
                    numberStr += '(';
                    break;
                case 4:
                    numberStr += ') ';
                    break;
                case 7:
                    numberStr += '-';
                    break;
            }
            numberStr += ch;
        });

        return numberStr;
    }
});

PMan.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        if (angular.isDefined(input)) {
            return input.slice(start)
        } else {
            return 0;
        }
    }
});

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

PMan.filter('searchFor', function(){

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function(arr, searchString,scope){
        if(arr == undefined)
            return;
        else if(!searchString){
            scope.noOfItems = arr.length;
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function(item){

            if((item.firstName && item.firstName.toLowerCase().indexOf(searchString) !== -1) ||
                (item.lastName && item.lastName.toLowerCase().indexOf(searchString) !== -1) ||
                (item.username && item.username.toLowerCase().indexOf(searchString) !== -1)){
                result.push(item);
            }

        });
        if(result.length == 0 && searchString){
            scope.noOfItems = -1
        }else{
            scope.noOfItems = result.length;
        }
        return result;
    };

});

PMan.filter('searchForOrganization', function(){

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function(arr, searchString,scope){
        if(arr == undefined)
            return;
        else if(!searchString){
            scope.noOfItems = arr.length;
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function(item){

            if((item.associatedCompanyName && item.associatedCompanyName.toLowerCase().indexOf(searchString) !== -1) ||
                (item.associatedCompanyUserName && item.associatedCompanyUserName.toLowerCase().indexOf(searchString) !== -1)){
                result.push(item);
            }

        });
        if(result.length == 0 && searchString){
            scope.noOfItems = -1
        }else{
            scope.noOfItems = result.length;
        }
        return result;
    };

});

PMan.filter('searchForBuyerGrp', function(){

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function(arr, searchString,scope){
        if(arr == undefined)
            return;
        else if(!searchString){
            scope.noOfItems = arr.length;
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function(item){

            if((item.groupName && item.groupName.toLowerCase().indexOf(searchString) !== -1) ||
                (item.groupDescription && item.groupDescription.toLowerCase().indexOf(searchString) !== -1)){
                result.push(item);
            }

        });
        if(result.length == 0 && searchString){
            scope.noOfItems = -1
        }else{
            scope.noOfItems = result.length;
        }
        return result;
    };

});

PMan.filter('searchForAddress', function(){

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function(arr, searchString,scope){
        if(arr == undefined)
            return;
        else if(!searchString){
            scope.noOfItems = arr.length;
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function(item){

            if((item.addressName && item.addressName.toLowerCase().indexOf(searchString) !== -1) ||
                (item.city && item.city.toLowerCase().indexOf(searchString) !== -1) ||
                (item.state && item.state.toLowerCase().indexOf(searchString) !== -1) ||
                (item.postalCode && item.postalCode.toLowerCase().indexOf(searchString) !== -1) ||
                (item.country && item.country.toLowerCase().indexOf(searchString) !== -1)){
                result.push(item);
            }

        });
        if(result.length == 0 && searchString){
            scope.noOfItems = -1
        }else{
            scope.noOfItems = result.length;
        }
        return result;
    };

});

PMan.filter('searchForCompany', function(){

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function(arr, searchString,scope){
        if(arr == undefined)
            return;
        else if(!searchString){
            scope.noOfItems = arr.length;
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function(item){

            if((item.companyCode && item.companyCode.toLowerCase().indexOf(searchString) !== -1) ||
                (item.companyCodeDescription && item.companyCodeDescription.toLowerCase().indexOf(searchString) !== -1) ){
                result.push(item);
            }

        });
        if(result.length == 0 && searchString){
            scope.noOfItems = -1
        }else{
            scope.noOfItems = result.length;
        }
        return result;
    };

});

PMan.filter('searchForGLAccount', function(){

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function(arr, searchString,scope){
        if(arr == undefined)
            return;
        else if(!searchString){
            scope.noOfItems = arr.length;
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function(item){

            if((item.glAccountCode && item.glAccountCode.toLowerCase().indexOf(searchString) !== -1) ||
                (item.glAccountDescription && item.glAccountDescription.toLowerCase().indexOf(searchString) !== -1) ){
                result.push(item);
            }

        });
        if(result.length == 0 && searchString){
            scope.noOfItems = -1
        }else{
            scope.noOfItems = result.length;
        }
        return result;
    };

});

PMan.filter('searchForMaterialGroup', function(){

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function(arr, searchString,scope){
        if(arr == undefined)
            return;
        else if(!searchString){
            scope.noOfItems = arr.length;
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function(item){

            if((item.materialGroupCode && item.materialGroupCode.toLowerCase().indexOf(searchString) !== -1) ||
                (item.materialGroupDescription && item.materialGroupDescription.toLowerCase().indexOf(searchString) !== -1) ){
                result.push(item);
            }

        });
        if(result.length == 0 && searchString){
            scope.noOfItems = -1
        }else{
            scope.noOfItems = result.length;
        }
        return result;
    };

});

PMan.filter('searchForSuppliers', function(){

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function(arr, searchString,scope){
        if(arr == undefined)
            return;
        else if(!searchString){
            scope.noOfItems = arr.length;
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function(item){

            if((item.companyName && item.companyName.toLowerCase().indexOf(searchString) !== -1) ||
                (item.contactName && item.contactName.toLowerCase().indexOf(searchString) !== -1) ||
                (item.email && item.email.toLowerCase().indexOf(searchString) !== -1) ||
                (item.defaultVendorId && item.defaultVendorId.toLowerCase().indexOf(searchString) !== -1)){
                result.push(item);
            }

        });
        if(result.length == 0 && searchString){
            scope.noOfItems = -1
        }else{
            scope.noOfItems = result.length;
        }
        return result;
    };

});

PMan.filter('searchForCostCenter', function(){

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function(arr, searchString,scope){
        if(arr == undefined)
            return;
        else if(!searchString){
            scope.noOfItems = arr.length;
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function(item){

            if((item.name && item.name.toLowerCase().indexOf(searchString) !== -1) ||
                (item.code && item.code.toLowerCase().indexOf(searchString) !== -1) ||
                    (item.description && item.description.toLowerCase().indexOf(searchString) !== -1)){
                result.push(item);
            }

        });
        if(result.length == 0 && searchString){
            scope.noOfItems = -1
        }else{
            scope.noOfItems = result.length;
        }
        return result;
    };

});
// {{myText|truncate:5}}
PMan.filter('truncate', function () {
    return function (text, length, end) {
        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        }
        else {
            return String(text).substring(0, length-end.length) + end;
        }

    };
});

PMan.filter('setStatus',function(){
    return function(status){
        if(status == true){
            return "Active" ;
        }else{
            return "Inactive" ;
        }
    }
});