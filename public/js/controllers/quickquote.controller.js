'use strict'

function QuickQuoteCtrl ($scope, $http, $routeParams) {
    var quotationId = $routeParams.quotationId;

    $scope.quotation = {};
    $scope.qr = {};

    $scope.quotation.requestDate = new Date(moment());
    $scope.quotation.quoteDate = new Date(moment());
    $scope.quotation.expirationDate = new Date(moment());
    $scope.quotation.deliveryDate = new Date(moment());

    $http({method: 'GET', url: 'api/quotations/' + quotationId})
        .success(function(data, status, headers,config) {
            if (data.requestDate != null && data.requestDate != "") {
                data.requestDate = new Date(moment(data.requestDate));
            }

            if (data.quoteDate != null && data.quoteDate != "") {
                data.quoteDate = new Date(moment(data.quoteDate));
            }

            if (data.expirationDate != null && data.expirationDate != "") {
                data.expirationDate = new Date(moment(data.expirationDate));
            }

            if (data.deliveryDate != null && data.deliveryDate != "") {
                data.deliveryDate = new Date(moment(data.deliveryDate));
            }

            $scope.quotation = data;
            console.log("111111111111",JSON.stringify(data));
            $scope.quotationRequestNumberFormatted = data.quotationRequestNumber;

            console.log(data.quotationRequestId);

            $scope.getQuotationRequestDetail(data.quotationRequestId);

            $scope.quotation.quote = '';
            $scope.quotation.quantity = '';
            $scope.quotation.unitPrice = '';

        }). error (function (data, status, headers,config){

        });

    $scope.getQuotationRequestDetail = function(quotationRequestId) {
        $http({method: 'GET', url: 'api/quotation-request/' + quotationRequestId})
        .success(function(data, status, headers,config) {
            console.log(data);
            console.log('items ', JSON.stringify(data.items[0]));
            $scope.qr = data.items[0];
        }). error (function (data, status, headers,config){

        });
    }

    $scope.quickQuote = function(){

var Quotation =
        {
            "quotationId": null,
            "quotationRequestId": $scope.quotation.quotationRequestId,
            "quotationRequestNumber": $scope.quotation.quotationRequestNumber,
            "purchaseRequestId" : null,
            "quotationNumber": $scope.quotation.quotationNumber,
            "quotationName": $scope.quotation.quotationName,
            "quoteDate": $scope.quotation.quoteDate,
            "buyerName": $scope.quotation.contactName,
            "contactName": $scope.quotation.contactName,
            "requestDate": $scope.quotation.requestDate,
            "supplierUniqueId": $scope.qr.supplierUniqueId,
            "expirationDate": $scope.quotation.expirationDate,
            "buyerGroup": null,
            "supplierId": $scope.qr.supplierId,
            "paymentTerms": $scope.qr.paymentTerms,
            "lineItem": $scope.qr.lineItem,
            "status": "PENDING",
            "unitPrice": $scope.quotation.unitPrice,
            "currency": "USD",
            "qty": $scope.quotation.qty,
            "deliveryDate": $scope.quotation.deliveryDate,
            "requestReason": "",
            "supplierName": $scope.qr.supplierName,
        };

        $http({method: 'POST', data: Quotation, url: 'api/quotations/'})
            .success(function(data, status, headers,config) {
                console.log('success', JSON.stringify(data));
            }). error (function (data, status, headers,config){

        });
    }

    // var d=new Date();
    // var year=d.getFullYear();
    // var month=d.getMonth()+1;
    // if (month<10){
    // month="0" + month;
    // };
    // var day=d.getDate();
    // $scope.curDate= month + "/" + day + "/" + year;

}
