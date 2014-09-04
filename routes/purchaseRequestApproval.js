var renderPage = require('../vroozi_modules/common').renderPage;
var serviceAggregator = require('../vroozi_modules/common').serviceAggregator;
api = require('../routes/api');
var settings = require('../conf/app_settings.js').settings;
var crypto = require('crypto');
var resources = require('../resources/resources');
var clone = require('clone');
var format = require('../extras/javascript-number-formatter').format;
var currencyCode = require('../extras/currencies').currencyCode;
var messages = require('../vroozi_modules/system-messages').messages;
var moment = require('moment');

exports.approvalView = function(req, res){
    var operation = req.params.operation;
    if(typeof req.params.operation == 'undefined') {
        // todo: bad bad bad...
    } else {

    }

    if(typeof req.params.token == 'undefined') {
        // todo: bad bad bad...
    }

    var tokens = {};
    decrypt(req.params.token).split("||").forEach(function(kv){
        kva = kv.split('=');
        tokens[kva[0]] = kva[1];
    });

    resources.CompanySettingsByUnitId.get(tokens.unitId, function(companyData,respHeader) {

        var logoForEmail;

        if(companyData && companyData.companyIcon) {
            logoForEmail = '/icons/' + companyData.companyIcon;
        } else {
            logoForEmail = '/images/vroozi-logo.png';
        }

        resources.PurchaseRequests.get(tokens.purchaseRequestId,
            function(data, respHeader) {
                var pr = clone(data);

                pr.orderNumber = pr.orderNumber.substr(0, 4)+'-'+pr.orderNumber.substr(4, 4)+'-'+pr.orderNumber.substr(8, 2);
                pr.createdDate = moment(pr.createdDate).format("MM/DD/YYYY");
                pr.token = req.params.token;

                if(data.status === 'PENDING') {
                    pr.viewApproved = false;
                    pr.viewRejected = false;
                    pr.pending = true;
                } else if(data.status === 'APPROVED') {
                    pr.viewApproved = true;
                    pr.viewRejected = false;
                    pr.pending = false;
                } else if(data.status === 'REJECTED') {
                    pr.viewApproved = false;
                    pr.viewRejected = true;
                    pr.pending = false;
                }

                if(operation === 'approve'){
                    pr.approve = true;
                    pr.reject = false;
                }

                if(operation === 'reject'){
                    pr.approve = false;
                    pr.reject = true;
                }

                pr.errorMessage = "";

                var subTotal = 0.00 ;
                var shippingCharges = 0.00  ;
                var taxAmount = 0.00 ;
                var currency = '';
                pr.items.forEach(function(item) {
                    subTotal += item.qty * item.unitPrice;
                    shippingCharges += item.shippingCharges != null ? parseFloat(item.shippingCharges) : 0.00;
                    taxAmount += item.taxableAmount != null ? parseFloat(item.taxableAmount) : 0.00;
                    item.unitPrice = currencyCode(item.currency) + format('#,###.#0#', item.unitPrice);
                    if (currency === '') {
                        currency = item.currency;
                    } else if (currency != item.currency) {
                        currency = 'MIXED'
                    }
                });
                pr.items.forEach(function(item){
                    if(item.supplierName == null || item.supplierName == "" || typeof item.supplierName == undefined ){
                        item.supplierName = item.recommendedSupplier;
                    }
                });
                var total = subTotal + shippingCharges + taxAmount;

                var ccode = '~';
                if(currency != 'MIXED') {
                    ccode = currencyCode(currency);
                }

                if(shippingCharges == null || shippingCharges == "" || typeof shippingCharges == undefined){
                    pr.shippingCharges = "0.00";
                }else{
                    pr.shippingCharges = format('#,###.#0', shippingCharges.toFixed(2));
                }
                if(taxAmount == null || taxAmount == "" || typeof taxAmount == undefined){
                    pr.taxAmount = "0.00";
                }else{
                    pr.taxAmount = format('#,###.#0', taxAmount.toFixed(2));
                }
                pr.totalAmount = format('#,###.#0', total.toFixed(2));
                //pr.totalAmount = ccode + format('#,###.#0#', total); //previous implementation to attach currency sign
                if(req.query["msg"]) {
                    pr.errorMessage = messages.errors[req.query["msg"]];
                    if(! pr.errorMessage) {
                        ps.errorMessage = "Unknown Error";
                    }
                }
                pr.logoName = logoForEmail;
                renderPage(res, 'purchase-request-approval', pr);
            }, function(error, respHeader) {
                // todo: handle
                console.log(error);
            });


    }, function(error, respHeader) {
        // todo: handle
        console.log('Error occurred while fetching company settings: ' + error);
    });


};

exports.approve = function(req, res){
    var providedPin = req.body.pin;
    if(! providedPin || providedPin.length == 0) {
        // todo: bad bad bad
    }

    var prStatus;
    if(req.body.approve) {
        prStatus = "APPROVED";
    } else if(req.body.reject) {
        prStatus = "REJECTED";
    } else {
        // todo: bad bad bad
    }

    var token = req.body.token;
    if(typeof req.params.token == 'undefined') {
        // todo: bad bad bad...
    }

    var tokens = {};
    decrypt(token).split("||").forEach(function(kv) {
        kva = kv.split('=');
        tokens[kva[0]] = kva[1];
    });

    resources.Profiles.get(tokens.approverId,
        function(user, respHeader) {
            // verify pin
            if(providedPin !== user.pin) {
                if(req.body.approve) {
                    res.redirect(302, settings.purchaseManagerWeb + "/purchaseRequests/approve/view/" + token + "?msg=M301");
                } else if(req.body.reject) {
                    res.redirect(302, settings.purchaseManagerWeb + "/purchaseRequests/reject/view/" + token + "?msg=M301");
                }
//                res.redirect(302, settings.purchaseManagerWeb + "/purchaseRequests/approve/view/" + token + "?msg=M301");
                return;
            }

            var msg = {
                unitId: tokens.unitId,
                userId: tokens.unitId,
                status: prStatus,
                reason: req.body.reason
            };

            resources.PurchaseRequestsApprovalStatus.update(tokens.purchaseRequestId, msg,
                function (data, respHeader) {
                    res.redirect(302, settings.purchaseManagerWeb + "/purchaseRequests/approve/view/" + token);
                },
                function (error, respHeader) {
                    // todo: handle
                    console.log(error);
                }
            );
        },
        function(error, respHeader) {
            // todo: handle
            console.log(error);
        }
    );
};

var verifyRenderPurchaseApproval = function (httpReq, httpsRes, req, res) {
    // verify
    if(req.sa.userPin !== req.param.provided.pin) {
        res.end({error: "Invalid pin code"});
        return;
    }

    // render
    var pr = {};
    pr.id = req.body.id;
    pr.requester = req.body.requester;
    pr.priority = req.body.priority;
    pr.createdDate = new Date(req.body.createdDate);
    pr.orderNumber = req.body.orderNumber;
    pr.reasonForRequest = req.body.reasonForRequest;
    pr.items = req.body.items;
    pr.items.forEach(function(item){
        if(item.supplierName == null || item.supplierName == "" || typeof item.supplierName == undefined ){
            item.supplierName = item.recommendedSupplier;
        }
    });

    pr.totalAmount = req.body.totalAmount;
    pr.token = req.params.token;

    renderPage(httpsRes, 'purchase-request-approval', pr);
};

// todo: make common
function decrypt(crypted) {
    var decipher = crypto.createDecipher('aes-128-ecb', settings.cookieEncryptionKey);
    var dec = decipher.update(crypted,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}
