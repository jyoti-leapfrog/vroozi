'use strict';

function CurrencyCtrl ($scope, Currencies, DefaultCurrency) {
    $scope.currencies = Currencies.list();

    var currencyCode = DefaultCurrency.get(function() {
        if(angular.isUndefined(currencyCode)) {
            currencyCode = 'USD';
        }
        $scope.currencies.forEach(function(currency) {
            if(currency.code == currencyCode.code) {
                $scope.selectedCurrency = currency;
            }
        });
    });

    // set default cost center
    $scope.defaultCurrencyChange = function(selectedCurrency) {
        DefaultCurrency.save({"code": $scope.selectedCurrency.code},
            function (data, respHeader) {
                // success
            }, function (data, respHeader) {
                noty({text: "System Error: " + data.status, type: "warning"});
            });
    };
}
