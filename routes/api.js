var fs = require("fs");
var http = require('http');
var settings = require('../conf/app_settings.js').settings;
var logger = require('../vroozi_modules/log-settings');
var common = require('../vroozi_modules/common');
var serviceAggregator = require('../vroozi_modules/common').serviceAggregator;
var renderPage = require('../vroozi_modules/common').renderPage;
var imageUtils = require('./imageUtils');
var url = require('url');
var path = require("path");
var moment = require("moment");

ElasticSearchClient = require('elasticsearchclient');

var serverOptions = {
    host: 'localhost',
    port: 9200,
    secure: false
};

var elasticSearchClient = new ElasticSearchClient(serverOptions);

var optionsConfig =
{
    purchaseApi: {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        root: settings.purchaseApiPath + '/api/organization/',
        headers: { "content-type": "application/json" }
    },
    userDataApi: {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        root: settings.userDataServicePath + '/api/',
        headers: {'accept': 'application/json'}
    }
};

var arr = [
    {
        id: '100',
        type: 'info',
        message: 'Welcome to the Vroozi Shopping Platform'
    }
];

function processResponse(res, restResponse, result) {
    restResponse.setEncoding('utf8');

    restResponse.on('data', function (chunk) {
        result += chunk
    });
    restResponse.on('end', function () {
        res.end(result);
    });
}

function processGET(options, req, res) {
    var result = '';
    http.get(options,function callback(response) {
        processResponse(res, response, result);
    }).on('error', function (e) {
            console.log('Problem with request: ' + e.message);
            res.send(500, e.message);
        });
}

function processPUT(options, req, res) {
}
function processPOST(options, req, res) {
}

exports.loadAclControls = function (req, res) {
    var displayControls = {};
    var allControls;
    fs.readFile('./vroozi_modules/acl-data.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        var allControls = JSON.parse(data);
        var roles = req.session.pManRoles;
        //   console.log(allControls);
        allControls.forEach(function (acl) {
            if (common.inArray(acl.allow, '*')) {
                acl.controls.forEach(function (acl) {
                    displayControls[acl] = true;
                });
            } else {
                acl.controls.forEach(function (control) {
                    var isAllowed = false;
                    if (roles) {
                        roles.forEach(function (role) {
                            if (common.inArray(acl.allow, role)) {
                                isAllowed = true;
                            }
                        });
                    }
                    displayControls[control] = isAllowed;
                });
            }
        });
        res.json(displayControls);
    });
};

exports.getNotifications = function (req, res) {
    res.json(arr);
};

exports.getPurchaseRequestSummary = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/orders-overview'
    processGET(options, req, res);
};

exports.getPurchaseRequestSummaries = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/orders-overview-requests'
    processGET(options, req, res);
};

exports.getPurchaseOrdersSummary = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = settings.purchaseApiPath + '/api/purchase-orders/orders-overview?unitid=' + req.session.unitId;
    processGET(options, req, res);
};

exports.getQuickRfxSummary = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = settings.purchaseApiPath + '/api/buyRoutesItems/'+ req.session.unitId  + '/unitId' ;
    processGET(options, req, res);
};

exports.getApproverPurchaseRequests = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/approver-email/' + req.session.username + '/purchase-requests';
    processGET(options, req, res);
};

exports.getApproverPurchaseRequestsUnDraft = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/approver-email/' + req.query.approverEmail + '/currentPage/' + req.query.currentPage + '/pageSize/' + req.query.pageSize + '/purchase-requests-undraft';
    processGET(options, req, res);
};

exports.getApproverAllPurchaseRequestsUnDraft = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/currentPage/' + req.query.currentPage + '/pageSize/' + req.query.pageSize + '/purchase-requests-all';
    processGET(options, req, res);
};
exports.getApproverPurchaseRequestsByStatus = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/approver-email/' + req.query.approverEmail + '/status/'+ req.query.status + '/currentPage/' + req.query.currentPage + '/pageSize/' + req.query.pageSize +  '/purchase-requests-status';
    processGET(options, req, res);
};

exports.getApproverPurchaseRequestsByApprover = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/approver-email/' + req.query.approverEmail + '/status/'+ req.query.status + '/currentPage/' + req.query.currentPage + '/pageSize/' + req.query.pageSize + '/purchase-requests-approver';
    processGET(options, req, res);
};

exports.getPaymentTerms = function (req, res) {
    var options = optionsConfig['userDataApi'];
    options.path = options.root + 'payment-terms';
    processGET(options, req, res);
};

exports.getSupplier = function (req, res) {
    var options = optionsConfig['userDataApi'];
    options.path = options.root + 'suppliers/'+req.params.id;
    processGET(options, req, res);
};

exports.getSupplierByUniqueId = function (req, res) {
    var unitId = req.session.unitId;
    var options = optionsConfig['userDataApi'];
    options.path = options.root + 'suppliers/uniqueid/'+req.params.id + '?unitId='+unitId;
    processGET(options, req, res);
};

exports.getSupplierByUniqueIdSearch = function (req, res,vendorId, onResponse) {
    var unitId = req.session.unitId;
    var options = optionsConfig['userDataApi'];
    options.path = options.root + 'suppliers/uniqueid/'+vendorId + '?unitId='+unitId;
    var result = '';
    http.get(options,function callback(response) {
        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            result += chunk
        });
        response.on('end', function () {
            onResponse(JSON.parse(result));
        });
    }).on('error', function (e) {
            console.log('Problem with request: ' + e.message);
            onResponse([]);
        });
};

exports.getPurchaseRequests = function (req, res) {
    var status = req.query.status === 'undefined' ? 'ALL' : req.query.status;
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/status/' + status + '/currentPage/'+ req.query.currentPage + '/pageSize/'+ req.query.pageSize +'/purchase-requests';
    processGET(options, req, res);
};

exports.getPurchaseRequestsPagination = function (req, res) {
    var status = req.query.status === 'undefined' ? 'ALL' : req.query.status;
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/status/' + status + '/currentPage/'+ 'req.query.currentPage' + '/pageSize/'+ 'req.query.pageSize' +'/purchase-requests';
    processGET(options, req, res);
};

exports.downloadPurchaseRequests = function (req, res) {
    var unitId = req.session.unitId;
    var userId = req.session.userId;
    var status = req.query.status === undefined ? 'ALL' : req.query.status;
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/purchase-requests/reports?status=' + status;
    
    
    var DOWNLOAD_DIR = settings.reportsFilePath;
    var file_name = '/purchase_overview_'+unitId+'_'+userId+'.xlsx';
    var file_path = path.resolve(path.normalize(DOWNLOAD_DIR), file_name);
    var file = fs.createWriteStream(file_path);
    
    http.get(options, function(res1) {
    	res1.on('data', function(data) {
            file.write(data);
        }).on('end', function() {
            file.end();
            console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
            res.redirect('/reports/'+file_name);
        });
    });
};

exports.getPurchaseOrders = function (req, res) {
  var options;
  var restReq;
  var result = '';
  var additionalParams = '';
  var status = req.query.status === 'undefined' ? 'ALL' : req.query.status;
  if (status) {
      additionalParams += '&status='+status;
  }

  if(req.query.purchaseRequestId) {
    //The url we want, plus the path and options we need
    options = {
      host: settings.purchaseApiHost,
      port: settings.purchaseApiPort,
      path: settings.purchaseApiPath + '/api/purchase-orders?purchaseRequestId=' + req.query.purchaseRequestId,
      method: 'GET',
      headers: {'accept': 'application/json'}
    };
  } else if(req.params.id) {
    //The url we want, plus the path and options we need
    options = {
      host: settings.purchaseApiHost,
      port: settings.purchaseApiPort,
      path: settings.purchaseApiPath + '/api/purchase-orders/' + req.params.id,
      method: 'GET',
      headers: {'accept': 'application/json'}
    };
  } else {
      options = {
          host: settings.purchaseApiHost,
          port: settings.purchaseApiPort,
          path: settings.purchaseApiPath + '/api/purchase-orders-pagination?unitid='+req.session.unitId+'&currentPage='+req.query.currentPage+'&pageSize='+req.query.pageSize+additionalParams,
          method: 'GET',
          headers: {'accept': 'application/json'}
      };
  }

  restReq = http.request(options);

  restReq.on('response', function (response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      result += chunk;
    });

    response.on('end', function () {
      res.end(result);
    });
  });

  restReq.on('error', function (e) {
    console.log('problem with request: ' + e.message);
    res.send(500, e.message);
  });

  restReq.end();
};
exports.createNewPurchaseOrder = newPurchaseOrder = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var options;
    var restReq;
    var result = '';


        //The url we want, plus the path and options we need
        options = {
            host: settings.purchaseApiHost,
            port: settings.purchaseApiPort,
            path: settings.purchaseApiPath + '/api/purchase-orders',
            method: 'POST',
            headers: {'content-type': 'application/json'}
        };


    restReq = http.request(options);
    var purchaseOrder = {userId: userId, unitId: unitId, createdDate: new Date(), creationDate: new Date(), status: 'DRAFT', shipAddresses: req.body.shipAddresses, companyAddress: req.body.companyAddress, requester: req.body.requester, approverId: req.body.approverId, deleted: false, subTotal: 0.00, shippingCharges: 0.00, taxAmount: 0.00, totalAmount: 0.00, currency: 'USD', items: [], priority: "Normal", effectiveDate: new Date()};
    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, e.message);
    });
    restReq.write(JSON.stringify(purchaseOrder));
    restReq.end();
};

exports.updatePurchaseOrder = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var id = req.params.id;
    var status = req.params.status;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-orders/' + id,
        headers: { "content-type": "application/json" },
        method: 'PUT'
    };

    try {
        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new rsequest. ' + e);
            });
        });

        var jsonObject = JSON.stringify(req.body);

        request.write(jsonObject);

        request.on('error', function (e) {
            logger.error('Error while updating request. ' + e);
        });
        request.end();

    } catch (err) {
        logger.error("Saving purchase request failed. ", err.stack);
    }
};

//update PO Items Qty from PR
exports.updatePurchaseOrdersItemQty = function (req, res) {
    var id = req.params.id;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-orders-qty/' + id,
        headers: { "content-type": "application/json" },
        method: 'PUT'
    };

    try {
        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new rsequest. ' + e);
            });
        });

        var jsonObject = JSON.stringify(req.body);

        request.write(jsonObject);

        request.on('error', function (e) {
            logger.error('Error while updating request. ' + e);
        });
        request.end();

    } catch (err) {
        logger.error("Saving purchase request failed. ", err.stack);
    }
};

exports.getCompanySettings = function (req, res) {
    var options = optionsConfig['userDataApi'];
    options.path = options.root + '/companysettings/unitid/' + req.session.unitId;
    processGET(options, req, res);
};

exports.updateCompanySettings = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var id = req.params.id;
    var status = req.params.status;

    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/companysettings/unitid/' + unitId,
        headers: { "content-type": "application/json" },
        method: 'PUT'
    };

    try {
        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' Company Settings saved.'+ unitId + "--------" + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving Company Settings. ' + e);
            });
        });

        var jsonObject = JSON.stringify(req.body);

        request.write(jsonObject);

        logger.debug(' Company Hasnain.'+ jsonObject);

        request.on('error', function (e) {
            logger.error('Error while updating Company Settings. ' + e);
        });
        request.end();

    } catch (err) {
        logger.error("Company Settings request failed. ", err.stack);
    }
};

exports.getLineItems = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = options.root + req.session.unitId + '/user/' + req.session.userId + '/purchase-requests/' + req.params.requestId + '/items',
        processGET(options, req, res);
};

exports.createLineItem = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var requestId = req.params.requestId;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-requests/' + requestId + '/items',
        headers: { "content-type": "application/json" },
        method: 'POST'
    };

    try {

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request item saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new item. ' + e);
            });
        });
        logger.debug('Adding line item.' + JSON.stringify(req.body));
        request.write(JSON.stringify(req.body));

        request.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });

        request.end();

    } catch (err) {
        logger.error("Saving purchase request failed. ", err.stack);
    }
};

exports.updateLineItem = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var requestId = req.params.requestId;
    var id = req.params.id;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-requests/' + requestId + '/items/' + id,
        headers: { "content-type": "application/json" },
        method: 'PUT'
    };

    try {

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request item saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new item. ' + e);
            });
        });

        request.write(JSON.stringify(req.body));
        request.end();

    } catch (err) {
        logger.error("Saving purchase request failed. ", err.stack);
    }
};

exports.deleteLineItem = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var requestId = req.params.requestId;
    var id = req.params.id;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-requests/' + requestId + '/items/' + id,
        headers: { "content-type": "application/json" },
        method: 'DELETE'
    };

    try {

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request item saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new item. ' + e);
            });
        });

        request.end();

    } catch (err) {
        logger.error("Saving purchase request failed. ", err.stack);
    }
};


exports.getPurchaseOrderLineItems = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = settings.purchaseApiPath + '/api/purchase-orders/'+req.params.orderId+'/items';
        processGET(options, req, res);
};

exports.createPurchaseOrderLineItem = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var requestId = req.params.requestId;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-orders/' + req.params.orderId + '/items',
        headers: { "content-type": "application/json" },
        method: 'POST'
    };

    try {

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request item saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new item. ' + e);
            });
        });
        logger.debug('Adding line item.' + JSON.stringify(req.body));
        request.write(JSON.stringify(req.body));

        request.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });

        request.end();

    } catch (err) {
        logger.error("Saving purchase request failed. ", err.stack);
    }
};

exports.updatePurchaseOrderLineItem = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var orderId = req.params.orderId;
    var id = req.params.id;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-orders/' + orderId + '/items/' + id,
        headers: { "content-type": "application/json" },
        method: 'PUT'
    };

    try {

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request item saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new item. ' + e);
            });
        });

        request.write(JSON.stringify(req.body));
        request.end();

    } catch (err) {
        logger.error("Saving purchase request failed. ", err.stack);
    }
};

exports.deletePurchaseOrderLineItem = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var orderId = req.params.orderId;
    var id = req.params.id;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-orders/' + orderId + '/items/' + id,
        headers: { "content-type": "application/json" },
        method: 'DELETE'
    };

    try {

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request item saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new item. ' + e);
            });
        });

        request.end();

    } catch (err) {
        logger.error("Saving purchase request failed. ", err.stack);
    }
};


exports.getProfile = getProfile = function (req, res) {
    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/userId/' + req.session.userId,
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, e.message);
    });

    restReq.end();
};

exports.getProfileByParam = getProfileByParam = function (req, res) {
    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/userId/' + req.body.userId,
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, e.message);
    });

    restReq.end();
};

exports.putProfile = putProfile = function (req, res) {
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var restReq = http.request(options);
    restReq.write(jsonObject);

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.json({});
    });

    restReq.on('response', function (response) {
        res.end('');
    });

    restReq.end();
};

exports.changePassword = function (req, res) {
    var pwdMessage = {};
    pwdMessage.userId = req.session.userId;
    pwdMessage.oldPassword = req.body.oldPassword;
    pwdMessage.newPassword = req.body.newPassword;
    var jsonObject = JSON.stringify(pwdMessage);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/changepassword',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        if (response.statusCode == 409) {
            res.send(409, "Can't change password");
        }
        res.end();
        apiReq.end();
    });
};

exports.getAddresses = getAddresses = function (req, res) {
    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/addresses?unitId=' + req.session.unitId,
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var result = '';
    var restReq = http.request(options);

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};

exports.addAddress = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/addresses',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.updateAddress = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/addresses/' + req.params.id,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.deleteAddress = function (req, res) {
    var jsonObject = JSON.stringify({});

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/addresses/' + req.params.id,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('data', function (chunk) {
        result += chunk;
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.setDefaultShippingAddress = function (req, res) {
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/' + req.session.userId + '/addresses/shipping',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        if (response.statusCode != 200) {
            res.send(response.statusCode, "REST API error!");
        }
        res.end();
        apiReq.end();
    });
};

exports.getDefaultShippingAddress = getDefaultShippingAddress = function (req, res) {
    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/' + req.session.userId + '/addresses/shipping',
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    // todo: handle 404

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            if (response.statusCode != 200) {
                res.send(response.statusCode, "REST API error!");
            }
            res.end(result);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};

exports.getCostCenters = function (req, res) {
    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/costCenters?unitId=' + req.session.unitId,
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var result = '';
    var restReq = http.request(options);

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};

exports.addCostCenter = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/costCenters',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.updateCostCenter = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/costCenters/' + req.params.id,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.deleteCostCenter = function (req, res) {
    var jsonObject = JSON.stringify({});

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/costCenters/' + req.params.id,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('data', function (chunk) {
        result += chunk;
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.setDefaultCostCenter = function (req, res) {
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/' + req.session.userId + '/defaults/costCenter',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        if (response.statusCode != 200) {
            res.send(response.statusCode, "REST API error!");
        }
        res.end();
        apiReq.end();
    });
};

exports.getDefaultCostCenter = function (req, res) {
    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/' + req.session.userId + '/defaults/costCenter',
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    // todo: handle 404

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            if (response.statusCode != 200) {
                res.send(response.statusCode, "REST API error!");
            }
            res.end(result);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};

exports.setDefaultCurrency = function (req, res) {
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/' + req.session.userId + '/defaults/currency',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        if (response.statusCode != 200) {
            res.send(response.statusCode, "REST API error!");
        }
        res.end();
        apiReq.end();
    });
};

exports.getDefaultCurrency = function (req, res) {
    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/' + req.session.userId + '/defaults/currency',
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    // todo: handle 404

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            if (response.statusCode != 200) {
                res.send(response.statusCode, "REST API error!");
            }
            res.end(result);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};

exports.createPurchaseRequest = function (req, res) {
    serviceAggregator(req, res, [
        {service: getProfile },
        {mapper: extractUserNameMapper },
        {service: getAddresses },
        {mapper: defaultShippingAddressMapper },
        {service: saveNewRequest }
    ]);
};

exports.createQuickRfxRequest = function (req, res) {
    console.log(JSON.stringify(req.body));
};

defaultShippingAddressMapper = defaultShippingAddressMapper = function (httpReq, httpsRes, req, res) {
    var shippingAddresses = req.body;
    var shippingId = httpReq.sa.shippingAddressId;
    var companyId = httpReq.sa.companyAddressId;

    shippingAddresses.forEach(function (address) {
        if (address.id == shippingId) {
            httpReq.body.shipAddresses = address;
        }
        if (address.id == companyId) {
            httpReq.body.companyAddress = address;
        }
    });

    res.end(httpReq.body);
}

extractUserNameMapper = function (httpReq, httpsRes, req, res) {
    var profile = req.body;
    var firstName = (profile.firstName != 'null') ? profile.firstName : '';
    var lastName = (profile.lastName != null && profile.lastName != 'null'  ) ? profile.lastName : '';
    httpReq.body.requester = firstName + ' ' + lastName;
    httpReq.body.approverId = profile.defaultApproverId;
    httpReq.sa.shippingAddressId = profile.addresses.shipping;
    httpReq.sa.companyAddressId = profile.addresses.company;
    res.end(httpReq.body);
}

saveNewRequest = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-requests',
        headers: { "content-type": "application/json" },
        method: 'POST'
    };

    try {

        var purchaseRequest = {userId: userId, unitId: unitId, createdDate: new Date(), status: 'NEW', shipAddresses: req.body.shipAddresses, requester: req.body.requester, approverId: req.body.approverId, deleted: false, subTotal: 0.00, shippingCharges: 0.00, taxAmount: 0.00, totalAmount: 0.00, currency: 'USD', items: [], priority: "Normal", effectiveDate: new Date()};
        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new request: ' + e);
            });
        });

        request.write(JSON.stringify(purchaseRequest));
        request.end();

    } catch (err) {
        logger.error("Saving purchase request failed. ", err.stack);
    }
};

exports.deletePurchaseRequest = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var id = req.params.id;
    var status = req.params.status;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-requests/' + id,
        headers: { "content-type": "application/json" },
        method: 'DELETE'
    };

    try {
        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request deleted.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new rsequest. ' + e);
            });
        });

        //request.write(JSON.stringify(req.body));
        request.end();

    } catch (err) {
        logger.error("Delete purchase request failed. ", err.stack);
    }
};

exports.deletePurchaseOrder = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var id = req.params.id;
    var status = req.params.status;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-orders/' + id,
        headers: { "content-type": "application/json" },
        method: 'DELETE'
    };

    try {
        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request deleted.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new rsequest. ' + e);
            });
        });

        //request.write(JSON.stringify(req.body));
        request.end();

    } catch (err) {
        logger.error("Delete purchase order failed. ", err.stack);
    }
};

exports.approvePurchaseRequestAggregator = function (req, res) {
    serviceAggregator(req, res, [
        { service: getProfileByParam },
        { mapper: extractPinMapper },
        { service: approvePurchaseRequest },
        { mapper: renderEmailApprovalPage}
    ]);
};

var extractPinMapper = function (httpReq, httpRes, req, res) {
    res.end({
        securityPin: req.body.pin || '',
        pin: httpReq.body.pin,
        requestId: httpReq.body.requestId,
        approve: httpReq.body.approve,
        reject: httpReq.body.reject,
        unitId: httpReq.body.unitId,
        userId: httpReq.body.userId,
        reason: httpReq.body.reason
    });
};

exports.approvePurchaseRequest = approvePurchaseRequest = function (req, res) {
    if (req.body.securityPin !== req.body.pin) {
        res.end({error: "Invalid pin code"});
        return;
    }

    var msg = {};
    msg.unitId = req.body.unitId;
    msg.userId = req.body.userId;

    resultMsg = {};

    resources.CompanySettingsByUnitId.get(msg.unitId, function(companyData,respHeader) {


        if(companyData && companyData.companyIcon) {
            msg.logoName = 'icons/' + companyData.companyIcon;
        } else {
            msg.logoName = 'images/vroozi-logo.png';
        }

        if (req.body.reject && req.body.reject.length > 0) {
            msg.status = 'REJECTED'
            resultMsg.approverDecision = 'rejected';
        } else if (req.body.approve && req.body.approve.length > 0) {
            msg.status = 'APPROVED';
            resultMsg.approverDecision = 'approved';
        } else {
            res.end({error: "System error! Please contact customer support!"});
            return;
        }
        resultMsg.requestId = req.body.requestId;
        msg.reason = req.body.reason;

        var jsonObject = JSON.stringify(msg);

        var options = {
            host: settings.purchaseApiHost,
            port: settings.purchaseApiPort,
            path: settings.purchaseApiPath + '/api/purchase-requests/' + req.body.requestId + '/approvalStatus',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
            },
            method: 'PUT'
        };

        try {
            var request = http.request(options, function (response) {
                var str = '';
                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    logger.debug('Purchase request was saved: ' + str);
                    res.end(resultMsg);
                });

                response.on('error', function (e) {
                    logger.error('Error while saving new request: ' + e);
                    res.end({error: "System error! If this error persist then please contact customer support!"});

                });
            });
            request.write(jsonObject);

            request.on('error', function (e) {
                logger.error('Error while updating request. ' + e);
            });
            request.end();

        } catch (err) {
            logger.error("Saving purchase request failed. ", err.stack);
            res.end({error: "System error! If this error persist then please contact customer support!"});
        }


    }, function(error, respHeader) {
        // todo: handle
        console.log('Error occurred while fetching company settings: ' + error);
    });

};

var renderEmailApprovalPage = function (httpReq, httpRes, req, res) {
    renderPage(httpRes, 'emailapprovalpage', req.body);
};

exports.updatePurchaseRequest = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var id = req.params.id;
    var status = req.params.status;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-requests/' + id,
        headers: { "content-type": "application/json" },
        method: 'PUT'
    };

    try {
        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new rsequest. ' + e);
            });
        });

        var jsonObject = JSON.stringify(req.body);

        request.write(jsonObject);

        request.on('error', function (e) {
            logger.error('Error while updating request. ' + e);
        });
        request.end();

    } catch (err) {
        logger.error("Saving purchase request failed. ", err.stack);
    }
};

exports.getPurchaseRequest = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var id = req.params.id;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/purchase-requests/' + id,
        headers: { "content-type": "application/json" },
        method: 'GET'
    };

    var restReq = http.request(options);
    var result = '';

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
        });

        response.on('error', function (e) {
            logger.error('Error while saving new request: ' + e);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};

exports.getPurchaseTemplate = function (req, res) {
    res.json(req.body);
};

exports.createPurchaseTemplate = function (req, res) {
    var obj = req.body;
    obj.id = 11;
    res.json(obj);
};

exports.updatePurchaseTemplate = function (req, res) {
    var obj = req.body;
    obj.id = 12;
    res.json(obj);
};


exports.getSuppliers = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var supplierName = req.query.suppliername;
    var additionalParams ='';
    if (typeof unitId != undefined && unitId) {
        additionalParams += '?unitid='+unitId;
//        console.log(unitId);
    }
    if (typeof supplierName != undefined && supplierName) {
        additionalParams += '&suppliername='+supplierName;
//        console.log(supplierName);
    }

    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/suppliers' + additionalParams,
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            logger.debug(' users result.' + result);
            res.end(result);
        });
        response.on('error', function () {
            console.log('problem with request: ' + e.message);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};

exports.getCountries = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/countryregion',
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            logger.debug(' users result.' + result);
            res.end(result);
        });
        response.on('error', function () {
            console.log('problem with request: ' + e.message);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};


exports.createSupplier = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/suppliers',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.updateSupplier = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/suppliers',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.deleteSupplier = function (req, res) {
    var jsonObject = JSON.stringify({});

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/suppliers/' + req.params.id + '/unitid/' + req.session.unitId,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('data', function (chunk) {
        result += chunk;
    });

    apiReq.on('response', function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            res.end(result);
        });

        response.on('error', function(e) {
            logger.error('Error while deleting supplier. '+e);
            res.json({"status":"400: "+e});
        });

    });
};

exports.getUoms = function (req, res) {
    res.json(' ');
}

exports.getCategories = function (req, res) {
    res.json(' ');

}

exports.getItems = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var cGroupToken = req.session.cGroupToken;
    logger.debug("userId from session:" + userId);
    logger.debug("unitId from session:" + unitId);
    logger.debug("cGroupToken from session:" + cGroupToken);

    if (typeof unitId == undefined || !unitId) {
        logger.error("unitId unavailable!");
        res.json({"status": "500 internal server error"});
    }

//    if (typeof cGroupToken == undefined || !cGroupToken) {
//        logger.error("cGroupToken unavailable!");
//        res.json({"status": "500 internal server error"});
//    }

    var landingPageData = {};
    var categoriesData = [];
    var suppliers = [];
    var profileIds = [];
    var catalogIds = [];

    getSearchResults(req, res, unitId, cGroupToken);
}

exports.getItem = function (req, res) {
    var catalogItemId = req.params.id;
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var noImageLogo = req.session.noImageLogo;

    getProductDetails(userId, unitId, catalogItemId, false, function (product) {
        product.imageUrl = imageUtils.getCatalogItemImageUrlLarge(product.image, product.transactionId, req.session.noImageLogo);
        product.supplierLogo = imageUtils.getSupplierImageUrl(product.supplierLogo);
        res.json(product);
    });
}

getProductDetails = function (userId, unitId, id, cart, onResponse) {
    var statusCode = '';
    var serviceName = '';
//    if (cart) {
//        serviceName = '/cart-products/' + id + '?unitid=' + unitId + '&userid=' + userId;
//    } else {
//        serviceName = '/products/' + id + '?unitid=' + unitId + '&userid=' + userId;
//    }
    serviceName = '/productoffers/' + id+ '?unitid=' + unitId + '&userid=' + userId;

    //console.log(serviceName);
    //The url we want, plus the path and options we need
    var options = {
        host: settings.contentManagerServiceHost,
        port: settings.contentManagerServicePort,
        path: settings.contentManagerServicePath + serviceName,
        method: 'GET'
    };

    var processResponse = function (response) {
        var productData = '';
        statusCode = response.statusCode;

        response.on('data', function (responseData) {
            productData += responseData;
        });

        response.on('end', function () {
            logger.debug('Item data recieved.');
            var product = {};
            if (response.statusCode != 200) {
                logger.debug('status ' + response.statusCode + ': item retrieval failed. \n' + productData);
            } else {
                try {
                    product = JSON.parse(productData);

                } catch (err) {
                    logger.error(err.stack);
                }
            }
            onResponse(product);
        });

        response.on('error', function (e) {
            logger.error('Error while retrieving items. ' + e);
            onResponse({"status": "400: " + e});
        });
    };

    // make the request, and then end it, to close the connection
    http.request(options, processResponse).end();
};

//function getSearchResults(req, res, unitId, cGroupToken) {
//    var productOffersList = [];
//    var searchResults = {};
//    var hitsFound = 0;
//    logger.debug("records Per Page: " + req.query.recordsPerPage);
//    var userId = req.session.userId;
//    var keyword = req.query.keyword;
//    var searchName = req.query.keyword;
//    if (keyword.substring(0, 7) == 'vendor:') {
//        var vendorStr = keyword.slice(7);
//        var ind = vendorStr.indexOf(':');
//        var vendorNum = vendorStr.slice(0, ind);
//        var vendorName = vendorStr.slice(ind + 1);
//        keyword = 'vendor:' + vendorNum;
//        searchName = vendorName;
//    }
//
//    var servicePath = settings.shopperServicePath + '/searchresults/company/' + settings.solrCoreForPurchaseManager + '/cgrouptoken/' + settings.contentViewGroupToken + '?keyword=' + encodeURIComponent(keyword);
//    if (typeof req.query.pageNo != undefined && req.query.pageNo) {
//        servicePath += '&pageNumber=' + req.query.pageNo;
//    }
////    if (typeof catalogIds != undefined && catalogIds) {
////    	servicePath += '&catalogIds='+catalogIds;
////    }
//    var decodedFilters;
//    if (typeof req.query.filterQuery != undefined && req.query.filterQuery) {
//        decodedFilters = decodeURIComponent(req.query.filterQuery);
//        servicePath += '&filterQuery=' + encodeURIComponent(req.query.filterQuery);
////        servicePath += '&filterQuery='+req.query.filterQuery;
//    }
//    if (typeof req.query.sortBy != undefined && req.query.sortBy) {
//        servicePath += '&sortBy=' + req.query.sortBy;
//    }
//    var recordsPerPage;
//    if (typeof req.query.recordsPerPage != undefined && req.query.recordsPerPage) {
//        recordsPerPage = req.query.recordsPerPage;
//    }
//    if (typeof req.query.searchType != undefined && req.query.searchType) {
//        servicePath += '&searchType=' + req.query.searchType;
//    }
////    if ((typeof recordsPerPage == undefined || !recordsPerPage) &&  typeof req.session.recordsPerPage != undefined && req.session.recordsPerPage) {
////        recordsPerPage = req.session.recordsPerPage;
////    }
//    if ((typeof recordsPerPage == undefined || !recordsPerPage)) {
//        recordsPerPage = '10';
//    }
//
//    servicePath += '&recordsPerPage=' + recordsPerPage;
//
//    logger.debug(servicePath);
//    //The url we want, plus the path and options we need
//    var options = {
//        host: settings.shopperServiceHost,
//        port: settings.shopperServicePort,
//        path: servicePath,
//        method: 'GET'
//    };
//
//    var strResponse = '';
//
//    var processResponse = function (response) {
//
//        // keep track of the data you receive
//        response.on('data', function (searchData) {
////            logger.debug(searchData);
//            strResponse += searchData;
//
//        });
//
////        finished? ok, write the data to a file
//        response.on('end', function () {
//            if (response.statusCode != 200) {
//                logger.debug('status ' + response.statusCode + ': Search results retrieval failed. \n' + strResponse);
//            } else {
//
//                try {
//                    var searchList = JSON.parse(strResponse);
//                    hitsFound = searchList.hitsFound;
//                    var i = 0;
//                    var productIds = [];
//                    if (typeof searchList.productOffers != undefined && searchList.productOffers) {
//                        (searchList.productOffers).forEach(function (product) {
//                            productIds.push(product.id);
//                            var productOffer = {};
//                            productOffer.id = product.id;
//                            productOffer.catalogId = product.catalogId;
//                            productOffer.title = product.name;
//                            productOffer.description = product.description;
//                            productOffer.unitPrice = parseFloat(Math.round(product.price * 100) / 100).toFixed(2);
////                            productOffer.priceRange = product.priceRange;
//                            if (product.priceRange && product.priceRange.length > 1) {
//                                var arr = product.priceRange.split("-");
//                                productOffer.priceRange = parseFloat(Math.round(arr[0] * 100) / 100).toFixed(2) + " - " + parseFloat(Math.round(arr[1] * 100) / 100).toFixed(2);
//                            }
//                            productOffer.icons = product.itemAttributesIcons;
//                            productOffer.currencyCode = product.currency;
//                            productOffer.materialGroup = product.materialGroup;
//                            productOffer.imageUrl = imageUtils.getCatalogItemImageUrlMedium(product.image, product.catalogId, req.session.noImageLogo);
//                            productOffer.vendorMat = product.vendorMat;
//                            productOffer.manufactMat = product.manufactMat;
//                            productOffer.quantity = "1";
//                            productOffer.minOrderQty = product.minOrderQty;
//                            if (!productOffer.minOrderQty) {
//                                productOffer.minOrderQty = "1";
//                            }
//                            productOffer.unit = product.unit;
//                            productOffer.supplierName = product.vendorName;
//                            productOffer.supplierLogo = imageUtils.getSupplierImageUrl(product.supplierName);
////                            if (typeof productOffer.supplierLogo != undefined && productOffer.supplierLogo) {
////                                productOffer.supplierLogo = productOffer.supplierLogo.replace("LARGE", "MEDIUM");
////                            }
//                            productOffer.itemConfig = (product.itemConfig && product.itemConfig == 1) ? true : false;
//                            productOffer.configurable = (product.configurable) ? true : false;
//                            productOffersList[i++] = productOffer;
//                        });
//                    }
//
//
//                    searchResults.items = productOffersList;
//                    searchResults.suppliers = searchList.suppliers;
//                    searchResults.companyAttributes = searchList.companyAttributes;
//                    (searchResults.companyAttributes).forEach(function (attr) {
//                        attr.attributeIcon = imageUtils.getSupplierImageUrl(attr.attributeIcon);
//                    });
//                    searchResults.itemAttributes = searchList.itemAttributes;
//                    (searchResults.itemAttributes).forEach(function (attr) {
//                        attr.attributeIcon = imageUtils.getIconUrl(attr.attributeIcon);
//                    });
//                    searchResults.customFieldPostFilters = searchList.customFieldPostFilters;
//                    searchResults.keyword = req.query.keyword;
//                    if (typeof req.query.categoryLabel != undefined && req.query.categoryLabel) {
//                        searchResults.searchName = req.query.categoryLabel;
//                    } else {
//                        searchResults.searchName = searchName;
//                    }
//                    if (typeof req.query.filterQuery != undefined && req.query.filterQuery) {
//                        searchResults.filterQuery = decodeURIComponent(req.query.filterQuery);
//                    }
//                    if (typeof req.query.sortBy != undefined && req.query.sortBy) {
//                        searchResults.sortBy = req.query.sortBy;
//                    }
//
//                    var paginationData = {};
//                    paginationData.pageSize = recordsPerPage;
//                    paginationData.currentPageNumber = req.query.pageNo;
//                    paginationData.totalNumberOfPages = Math.ceil(hitsFound / paginationData.pageSize);
//                    paginationData.totalNumberOfItems = hitsFound;
//                    paginationData.recordStart = (paginationData.pageSize * (req.query.pageNo - 1)) + 1;
//                    paginationData.recordEnd = paginationData.pageSize * req.query.pageNo;
//
//                    searchResults.pagination = paginationData;
//
//                    res.json(searchResults);
//                } catch (err) {
//                    logger.debug(strResponse);
//                    logger.error('Error while retrieving search results.' + err.stack);
//                    res.json({"status": "400: " + err});
//                }
//            }
//        });
//        response.on('error', function (e) {
//            logger.error('Error while retrieving search results.');
//            res.json({"status": "400: " + err});
//        });
//    };
//
//    try {
//        // make the request, and then end it, to close the connection
//        http.request(options, processResponse).end();
//    } catch (err) {
//        logger.error('Error while retrieving search results.' + err.stack);
//        res.json({"status": "400: " + err});
//    }
//}

function getSearchResults(req, res, unitId, cGroupToken) {
    var productOffersList = [];
    var searchResults = {};
    var hitsFound = 0;
    logger.debug("records Per Page: " + req.query.recordsPerPage);
    var userId = req.session.userId;
    var keyword = req.query.keyword;
    var searchName = req.query.keyword;
    var pageNo = req.query.pageNo;
    if ((typeof pageNo == undefined || !pageNo)) {
        pageNo = '1';
    }
    var recordsPerPage = req.query.recordsPerPage;
        if ((typeof recordsPerPage == undefined || !recordsPerPage)) {
        recordsPerPage = '10';
    }

    var query;

    if (typeof keyword != 'undefined' && keyword) {
        keyword = keyword.trim();
        if (keyword.indexOf('*') != -1 || keyword.indexOf('?') != -1) {
            if (keyword == "*") {
                query = {
                    "match_all" : {}
                }
            } else {
                query = {
                    "query_string": {
                        "query": keyword,
                        "fields": [ "shortDescription^5", "longDescription^4", "productCategory^3", "manufacturerName^2", "vendorMat", "mpn", "vendorId", "brandName", "supplierName" ]
                    }
                }
            }

        } else {
            query = {
                "multi_match": {
                    "query": keyword,
                    "fields": [ "shortDescription^5", "longDescription^4", "productCategory^3", "manufacturerName^2", "vendorMat", "mpn", "vendorId", "brandName", "supplierName" ]
                }
            }
        }
    }

    var qryObj = {
        "query": query,
        "filter": {
            "term": { "unitId": unitId }
        },
        "from":(pageNo-1)*recordsPerPage,
        "size":recordsPerPage
    };

    var strResponse = '';

    elasticSearchClient.search('content_manager', 'product_offers',qryObj)
        .on('data', function(data) {
        // keep track of the data you receive

//            logger.debug(searchData);
            strResponse += data;
            var rest;
            // sending res 200 to call the callback function on no search result.
            var tempSearchList = JSON.parse(strResponse);
            hitsFound = tempSearchList.hits.total;
            if(hitsFound == 0){
                res.send(200,tempSearchList);
            }
        })

//        finished? ok, write the data to a file
        .on('done', function () {

                try {
                    var searchList = JSON.parse(strResponse);
                    hitsFound = searchList.hits.total;
                    var itemsFound = searchList.hits.hits;
                    var i = 0;
                    var productIds = [];
                    var supplierIds = '';
                    if (typeof itemsFound != undefined && itemsFound) {
                        for (var j = 0; j < itemsFound.length; j++) {
                            var product = itemsFound[j]._source;
                            productIds.push(product.itemId);
                            var productOffer = {};
                            productOffer.id = product.itemId;
                            productOffer.title = product.shortDescription;
                            productOffer.description = product.longDescription;
                            productOffer.unitPrice = parseFloat(Math.round(product.price * 100) / 100).toFixed(2);
//                            productOffer.priceRange = product.priceRange;
//                            if (product.priceRange && product.priceRange.length > 1) {
//                                var arr = product.priceRange.split("-");
//                                productOffer.priceRange = parseFloat(Math.round(arr[0] * 100) / 100).toFixed(2) + " - " + parseFloat(Math.round(arr[1] * 100) / 100).toFixed(2);
//                            }
                            productOffer.currencyCode = product.currency;
                            productOffer.materialGroup = product.productCategory;
                            productOffer.imageUrl = imageUtils.getCatalogItemImageUrlMedium(product.image, product.transactionId, req.session.noImageLogo);
                            productOffer.vendorMat = product.vendorMat;
                            productOffer.manufactMat = product.mpn;
                            productOffer.quantity = "1";
                            productOffer.minOrderQty = product.minOrderQty;
                            if (!productOffer.minOrderQty) {
                                productOffer.minOrderQty = "1";
                            }
                            productOffer.unit = product.uom;
                            productOffer.supplierName = product.supplierName;
                            productOffer.supplierId = product.vendorId;
                            console.log('vendor id:'+product.vendorId);
                            productOffer.manufacturerName = product.manufacturerName;
                            productOffer.brandName = product.brandName;
                            productOffer.service = product.service;
//                           productOffer.supplierLogo = imageUtils.getSupplierImageUrl(product.supplierLogo);
//                            if (typeof productOffer.supplierLogo != undefined && productOffer.supplierLogo) {
//                                productOffer.supplierLogo = productOffer.supplierLogo.replace("LARGE", "MEDIUM");
//                            }
                            productOffer.itemConfig = (product.itemConfig && product.itemConfig == 1) ? true : false;
                            productOffer.configurable = (product.configurable) ? true : false;
                            productOffersList[i++] = productOffer;
                            supplierIds += product.vendorId + ',';
                        }
                        supplierIds = supplierIds.substr(0, supplierIds.length-1);
                    }


                    searchResults.items = productOffersList;
                    searchResults.suppliers = searchList.suppliers;
                    searchResults.companyAttributes = searchList.companyAttributes;

                    searchResults.itemAttributes = searchList.itemAttributes;

                    searchResults.customFieldPostFilters = searchList.customFieldPostFilters;
                    searchResults.keyword = req.query.keyword;
                    if (typeof req.query.categoryLabel != undefined && req.query.categoryLabel) {
                        searchResults.searchName = req.query.categoryLabel;
                    } else {
                        searchResults.searchName = searchName;
                    }
                    if (typeof req.query.filterQuery != undefined && req.query.filterQuery) {
                        searchResults.filterQuery = decodeURIComponent(req.query.filterQuery);
                    }
                    if (typeof req.query.sortBy != undefined && req.query.sortBy) {
                        searchResults.sortBy = req.query.sortBy;
                    }

                    var paginationData = {};
                    paginationData.pageSize = recordsPerPage;
                    paginationData.currentPageNumber = req.query.pageNo;
                    paginationData.totalNumberOfPages = Math.ceil(hitsFound / paginationData.pageSize);
                    paginationData.totalNumberOfItems = hitsFound;
                    paginationData.recordStart = (paginationData.pageSize * (req.query.pageNo - 1)) + 1;
                    paginationData.recordEnd = paginationData.pageSize * req.query.pageNo;

                    searchResults.pagination = paginationData;
                    /*FALC-306 Instead of bringing supplier logo from elastic search, fetch from Mongo, will help in case of supplier logo change*/
                    exports.getSupplierByUniqueIdSearch(req,res,supplierIds,function(result){
                        for(var j = 0; j < searchResults.items.length ; j++) {
                            for(var i = 0; i < result.length ; i++) {
                                if(result[i].uniqueSupplierId == searchResults.items[j].supplierId) {
                                    var supp = result[i].logo;
                                    if(supp) {
                                        supp = supp.substr(supp.lastIndexOf("/"),supp.length);
                                        searchResults.items[j].supplierLogo = "/supplier" + supp;
                                        searchResults.items[j].supplierId = result[i].companyId;
                                        break;
                                    }
                                }
                            }

                        }

                        res.json(searchResults);
                    });

                } catch (err) {
                    logger.debug(strResponse);
                    logger.error('Error while retrieving search results.' + err.stack);
                    res.json({"status": "400: " + err});
                }
        })
        .on('error', function (e) {
            logger.error('Error while retrieving search results.');
            res.json({"status": "400: " + err});
        })
        .exec();


//    try {
//        // make the request, and then end it, to close the connection
//        http.request(options, processResponse).end();
//    } catch (err) {
//        logger.error('Error while retrieving search results.' + err.stack);
//        res.json({"status": "400: " + err});
//    }
}

exports.getUsers = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var username = req.query.username;
    var additionalParams ='';
    if (typeof username != undefined && username) {
        additionalParams += '&username='+username;
//        console.log(username);
    }
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users?unitid=' + unitId+additionalParams,
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            logger.debug(' users result.' + result);
            var userIndex = -1;
            var index = 0
            var allUsers = JSON.parse(result);

            if(req.query.roles && req.query.roles.length > 0) {
                allUsers = filterUsersByRole(allUsers, req.query.roles);
            }
            if(typeof req.query.includeSelf != 'undefined' && req.query.includeSelf == "false") {
                allUsers = filterSelfFromUsers(allUsers, userId);
            }

            res.end(JSON.stringify(allUsers));
        });
        response.on('error', function () {
            console.log('problem with request: ' + e.message);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};

exports.getUser = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
//    var userId = req.query.id;

    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/userId/'+userId,
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            logger.debug(' users result.' + result);
            var userIndex = -1;
            var index = 0
            var allUsers = JSON.parse(result);

            if(req.query.roles && req.query.roles.length > 0) {
                allUsers = filterUsersByRole(allUsers, req.query.roles);
            }
            if(typeof req.query.includeSelf != 'undefined' && req.query.includeSelf == "false") {
                allUsers = filterSelfFromUsers(allUsers, userId);
            }

            res.end(JSON.stringify(allUsers));
        });
        response.on('error', function () {
            console.log('problem with request: ' + e.message);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};

var filterUsersByRole = function(users, rolesString) {
    roles = {};
    rolesArray = rolesString.split(',');
    rolesArray.forEach(function(item) {
        item = item.trim();
        var initial = item.charAt(0).toUpperCase();
        item = initial + item.substr(1);
        roles[item] = true;
    });

    filteredUsers = [];
    users.forEach(function(user) {
        if (user.rolesPerApp && user.rolesPerApp.purchaseManagerRoles) {
            user.rolesPerApp.purchaseManagerRoles.forEach(function(role) {
                if(roles[role]) {
                    filteredUsers.push(user);
                }
            });
        }
    });

    return filteredUsers;
};

var filterSelfFromUsers = function(users, selfUserId) {
    for(var index=0; index<users.length; index++) {
        if(users[index].userId == selfUserId) {
            users.splice(index, 1);
            break;
        }
    }

    return users;
};

exports.addUser = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.findUser = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/new-user-registration/email/'+encodeURIComponent(req.query.emailToValidate)+'/details',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.deleteUser = function (req, res) {
    var jsonObject = JSON.stringify({});

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/' + req.params.id,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('data', function (chunk) {
        result += chunk;
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.updateUser = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.sendResetEmail = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/reset-password',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.getContents = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var options = {
        host: settings.contentManagerServiceHost,
        port: settings.contentManagerServicePort,
        path: settings.contentManagerServicePath + '/productoffers?unitid=' + unitId,
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            logger.debug(' users result.' + result);
            var userIndex = -1;
            var index = 0
            var allUsers = JSON.parse(result);

            allUsers.forEach(function (user) {
                if (user.userId == userId) {
                    userIndex = index;
                }
                index++;
            });
            if (userIndex != -1) {
                allUsers.splice(userIndex, 1);
            }
            res.end(JSON.stringify(allUsers));
        });
        response.on('error', function () {
            console.log('problem with request: ' + e.message);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};
exports.deleteProductOffer = function (req, res) {
    var jsonObject = JSON.stringify({});

    //The url we want, plus the path and options we need
    var options = {
        host: settings.contentManagerServiceHost,
        port: settings.contentManagerServicePort,
        path: settings.contentManagerServicePath + '/productoffers/' + req.params.id,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('data', function (chunk) {
        result += chunk;
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.deleteFromSearchIndex = function (req, res) {
    var docId = req.params.id;

    //The url we want, plus the path and options we need
    var strResponse = '';

    elasticSearchClient.deleteDocument('content_manager', 'product_offers', docId)
        .on('data', function(data) {
            // keep track of the data you receive

//            logger.debug(searchData);
            strResponse += data;

        })

//        finished? ok, write the data to a file
        .on('done', function () {

            try {
                var serviceResponse = JSON.parse(strResponse);


                res.json(serviceResponse);
            } catch (err) {
                logger.debug(strResponse);
                logger.error('Error while deleting document from index.' + err.stack);
                res.json({"status": "400: " + err});
            }
        })
        .on('error', function (e) {
            logger.error('Error while deleting document from index.');
            res.json({"status": "400: " + err});
        })
        .exec();

};




exports.generateReport = function (req, res) {
	var unitId = req.session.unitId;
	var userId = req.session.userId;
	var reportId = req.params.reportId;
	var days = req.query.days;
    var status = req.query.status === undefined ? 'ALL' : req.query.status;
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
	var options = optionsConfig['purchaseApi'];
	
    if(reportId == 1) {
    	options.path = options.root + req.session.unitId + '/purchase-requests/reports?status=' + status;
    	if(days) {
    		options.path += '&days=' + days;
    	} else {
    		options.path += '&startDate=' + startDate + '&endDate='+endDate;
    	}
    	
		var DOWNLOAD_DIR = settings.reportsFilePath;
		var file_name = '/purchase_overview_'+unitId+'_'+userId+'.xlsx';
		var file_path = path.resolve(path.normalize(DOWNLOAD_DIR), file_name);
		var file = fs.createWriteStream(file_path);
		
		http.get(options, function(res1) {
			res1.on('data', function(data) {
		        file.write(data);
		    }).on('end', function() {
		        file.end();
		        console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);

		        res.redirect('/reports/'+file_name);
		    });
		});

    } else {
    	res.json({"status": "400"});
    }
};

exports.generatePDF = function (req, res) {
    var unitId = req.session.unitId;
    var userId = req.session.userId;
    var purchaseRequestId = req.params.purchaseRequestId;
    var options = optionsConfig['purchaseApi'];

    if( purchaseRequestId ) {
        options.path = options.root + req.session.unitId + '/purchase-requests/pdfreports?purchaserequestid=' + purchaseRequestId;

        var DOWNLOAD_DIR = settings.reportsFilePath;
        var file_name = '/purchase_overview_'+unitId+'_'+userId+'.pdf';
        var file_path = path.resolve(path.normalize(DOWNLOAD_DIR), file_name);
        var file = fs.createWriteStream(file_path);

        http.get(options, function(res1) {
            res1.on('data', function(data) {
                file.write(data);
            }).on('end', function() {
                    file.end();
                    console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);

                    res.redirect('/reports/'+file_name);
                });
        });

    } else {
        res.json({"status": "400"});
    }
};

exports.generateOrderPDF = function (req, res) {    
    // console.log('asdfasdf');
    var unitId = req.session.unitId;
    var userId = req.session.userId;
    var purchaseOrderId = req.params.purchaseOrderId;
    var options = optionsConfig['purchaseApi'];

    if( purchaseOrderId ) {
        options.path = options.root + req.session.unitId + '/purchase-order/pdforderreports?purchaserequestid=' + purchaseOrderId;
        console.log(options.path);
        var DOWNLOAD_DIR = settings.reportsFilePath;
        var file_name = '/purchase_order_overview_'+unitId+'_'+userId+'.pdf';
        var file_path = path.resolve(path.normalize(DOWNLOAD_DIR), file_name);
        var file = fs.createWriteStream(file_path);

        http.get(options, function(res1) {
            res1.on('data', function(data) {
                file.write(data);
            }).on('end', function() {
                    file.end();
                    console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
                    res.redirect('/reports/'+file_name);
                });
        });

    } else {
        res.json({"status": "400"});
    }
};

exports.initiateTransaction = function (req, res, data) {
//    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(data);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.contentManagerServiceHost,
        port: settings.contentManagerServicePort,
        path: settings.contentManagerServicePath + '/catalogs/staging',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.setDefaultCompanyAddress = function (req, res) {
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/' + req.session.userId + '/addresses/company',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        if (response.statusCode != 200) {
            res.send(response.statusCode, "REST API error!");
        }
        res.end();
        apiReq.end();
    });
};

exports.getDefaultCompanyAddress = getDefaultCompanyAddress = function (req, res) {
    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/users/' + req.session.userId + '/addresses/company',
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var restReq = http.request(options);
    var result = '';

    // todo: handle 404

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            if (response.statusCode != 200) {
                res.send(response.statusCode, "REST API error!");
            }
            res.end(result);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};


exports.createPurchaseOrder = function (req, res) {
    serviceAggregator(req, res, [
        {service: getProfile },
        {mapper: extractUserNameMapper },
        {service: getAddresses },
        {mapper: defaultShippingAddressMapper },
        {service: newPurchaseOrder }
    ]);
};

exports.getBuyerGroups = function (req, res) {
    var unitId = req.session.unitId;
    var additionalParams = '';
    if (typeof unitId != undefined && unitId) {
        additionalParams += '?unitid=' + unitId;
    }
    var options = optionsConfig['purchaseApi'];
    options.path = settings.purchaseApiPath + '/api/buyer-groups' + additionalParams;
    processGET(options, req, res);
};

exports.createBuyerGroup = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var requestId = req.params.requestId;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/buyer-groups',
        headers: { "content-type": "application/json" },
        method: 'POST'
    };

    try {
        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' buyer group saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new buyer group. ' + e);
            });
        });
        logger.debug('Adding buyer group.' + JSON.stringify(req.body));
        var body = JSON.stringify(req.body);
        var bodyObj = JSON.parse(body);
        bodyObj.unitId = unitId;
        request.write(JSON.stringify(bodyObj));

        request.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });

        request.end();

    } catch (err) {
        logger.error("Saving buyer group failed. ", err.stack);
    }
};

exports.updateBuyerGroup = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var id = req.params.id;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/buyer-groups/' + id,
        headers: { "content-type": "application/json" },
        method: 'PUT'
    };

    try {

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' buyer group updated.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while updating buyer group. ' + e);
            });
        });

        var body = JSON.stringify(req.body);
        var bodyObj = JSON.parse(body);
        bodyObj.unitId = unitId;
        request.write(JSON.stringify(bodyObj));
        request.end();

    } catch (err) {
        logger.error("Updating buyer group failed. ", err.stack);
    }
};

exports.deleteBuyerGroup = function (req, res) {
    var jsonObject = JSON.stringify({});

    //The url we want, plus the path and options we need
    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/buyer-groups/' + req.params.id,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('data', function (chunk) {
        result += chunk;
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.getBuyerGroupById = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = settings.purchaseApiPath + '/api/buyer-group/' + req.params.groupId;
    processGET(options, req, res);
};

exports.getBuyerGroupsByCategory = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    var categoryCode;
    var supplier;
    if(req.query.categoryCode == null || req.query.categoryCode == ' '){
        categoryCode = null;
    }else{
        categoryCode = req.query.categoryCode;
    }
    if(req.query.supplier == null || req.query.supplier == ' '){
        supplier = null;
    }else{
        supplier = req.query.supplier;
    }
    options.path = settings.purchaseApiPath + '/api/' + req.session.unitId + '/user/' + categoryCode + '/category-code/' + supplier + '/supplier';
    processGET(options, req, res);
};

exports.getDefaultCompanyBuyerGroup = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    options.path = settings.purchaseApiPath + '/api/default-company-buyer-group/' + req.session.unitId;
    console.log(options.path);
    processGET(options, req, res);
};

exports.createCompanyCode = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var requestId = req.params.requestId;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/company-code',
        headers: { "content-type": "application/json" },
        method: 'POST'
    };

    try {
        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' company code saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new company code. ' + e);
            });
        });
        logger.debug('Adding company code.' + JSON.stringify(req.body));
        var body = JSON.stringify(req.body);
        var bodyObj = JSON.parse(body);
        bodyObj.unitId = unitId;
        request.write(JSON.stringify(bodyObj));

        request.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });

        request.end();

    } catch (err) {
        logger.error("Saving company code failed. ", err.stack);
    }
};
exports.getCompanyCode = function (req, res) {
    var unitId = req.session.unitId;
    var additionalParams = '';
    if (typeof unitId != undefined && unitId) {
        additionalParams += '?unitid=' + unitId;
    }
    var options = optionsConfig['purchaseApi'];
    options.path = settings.purchaseApiPath + '/api/company-code' + additionalParams;
    processGET(options, req, res);
};
exports.updateCompanyCode = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var id = req.params.id;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/company-code/' + id,
        headers: { "content-type": "application/json" },
        method: 'PUT'
    };

    try {

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' company code updated.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while updating company code. ' + e);
            });
        });

        var body = JSON.stringify(req.body);
        var bodyObj = JSON.parse(body);
        bodyObj.unitId = unitId;
        request.write(JSON.stringify(bodyObj));
        request.end();

    } catch (err) {
        logger.error("Updating company code failed. ", err.stack);
    }
};

exports.deleteCompanyCode = function (req, res) {
    var jsonObject = JSON.stringify({});

    //The url we want, plus the path and options we need
    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/company-code/' + req.params.id,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('data', function (chunk) {
        result += chunk;
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.deleteAssCompanyCode = function (req, res) {
    var unitId = req.session.unitId;
    var jsonObject = JSON.stringify({});

    //The url we want, plus the path and options we need
    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/company-code/' + req.params.id + '/unitId/' + unitId,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('data', function (chunk) {
        result += chunk;
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

//GLAccounts
exports.getGLAccounts = function (req, res) {
    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/glaccounts?unitId=' + req.session.unitId,
        method: 'GET',
        headers: {'accept': 'application/json'}
    };

    var result = '';
    var restReq = http.request(options);

    restReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
        });
    });

    restReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    restReq.end();
};

exports.addGLAccount = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/glaccounts',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.updateGLAccount = function (req, res) {
    req.body.unitId = req.session.unitId;
    var jsonObject = JSON.stringify(req.body);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/glaccounts/' + req.params.id,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.deleteGLAccount = function (req, res) {
    var jsonObject = JSON.stringify({});

    //The url we want, plus the path and options we need
    var options = {
        host: settings.userDataServiceHost,
        port: settings.userDataServicePort,
        path: settings.userDataServicePath + '/api/glaccounts/' + req.params.id,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('data', function (chunk) {
        result += chunk;
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.createMaterialGroup = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var requestId = req.params.requestId;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/material-group',
        headers: { "content-type": "application/json" },
        method: 'POST'
    };

    try {
        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' Material Group saved.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while saving new Material Group. ' + e);
            });
        });
        logger.debug('Adding Material Group.' + JSON.stringify(req.body));
        var body = JSON.stringify(req.body);
        var bodyObj = JSON.parse(body);
        bodyObj.unitId = unitId;
        request.write(JSON.stringify(bodyObj));

        request.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });

        request.end();

    } catch (err) {
        logger.error("Saving Material Group failed. ", err.stack);
    }
};
exports.getMaterialGroup = function (req, res) {
    var unitId = req.session.unitId;
    var additionalParams = '';
    if (typeof unitId != undefined && unitId) {
        additionalParams += '?unitid=' + unitId;
    }
    var options = optionsConfig['purchaseApi'];
    options.path = settings.purchaseApiPath + '/api/material-group' + additionalParams;
    processGET(options, req, res);
};
exports.updateMaterialGroup = function (req, res) {
    var userId = req.session.userId;
    var unitId = req.session.unitId;
    var id = req.params.id;

    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/material-group/' + id,
        headers: { "content-type": "application/json" },
        method: 'PUT'
    };

    try {

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' Material Group updated.' + str);
                res.end(str);
            });

            response.on('error', function (e) {
                logger.error('Error while updating Material Group. ' + e);
            });
        });

        var body = JSON.stringify(req.body);
        var bodyObj = JSON.parse(body);
        bodyObj.unitId = unitId;
        request.write(JSON.stringify(bodyObj));
        request.end();

    } catch (err) {
        logger.error("Updating Material Group failed. ", err.stack);
    }
};

exports.deleteMaterialGroup = function (req, res) {
    var jsonObject = JSON.stringify({});

    //The url we want, plus the path and options we need
    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/material-group/' + req.params.id,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonObject);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('data', function (chunk) {
        result += chunk;
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

// Quotations
exports.addUpdateQuotationRequest = function (req, res) {
    var unitId = req.session.unitId;
    
    var jsonObject = req.body;
    jsonObject.deadline = (req.body.deadline==null || req.body.deadline=="") ? null : moment(req.body.deadline).unix();
    jsonObject.effectiveDate = req.body.effectiveDate==null ? null : moment(req.body.effectiveDate).unix();
    jsonObject.createdDate = req.body.createdDate==null ? null : moment(req.body.createdDate).unix();

    jsonObject.unitId = unitId;
    
    var jsonString = JSON.stringify(jsonObject);

    console.log(jsonString);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/quotation-request?suppliers=' + req.params.supplierIds,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonString, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonString);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.createquickquote = function (req, res) {
    var unitId = req.session.unitId;

    var jsonObject = req.body;

    jsonObject.quoteDate = req.body.quoteDate==null ? null : moment(req.body.quoteDate).unix();
    jsonObject.deliveryDate = req.body.deliveryDate==null ? null : moment(req.body.deliveryDate).unix();
    jsonObject.requestDate = req.body.requestDate==null ? null : moment(req.body.requestDate).unix();
    jsonObject.expirationDate = req.body.expirationDate==null ? null : moment(req.body.expirationDate).unix();

    
    jsonObject.unitId = unitId;
    
    var jsonString = JSON.stringify(jsonObject);

    console.log(jsonString);

    //The url we want, plus the path and options we need
    var options = {
        host: settings.purchaseApiHost,
        port: settings.purchaseApiPort,
        path: settings.purchaseApiPath + '/api/quotations',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonString, 'utf8')
        }
    };

    var result = '';
    var apiReq = http.request(options);
    apiReq.write(jsonString);

    apiReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        res.send(500, "Internal error");
        res.end();
    });

    apiReq.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            result += chunk;
        });

        response.on('end', function () {
            res.end(result);
            apiReq.end();
        });
    });
};

exports.getQuotation = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    var quotationId = req.params.quotationId;
    if(!quotationId){
        console.log('No quotationId received');
        return;        
    }

    console.log(settings.purchaseApiPath + '/api/quotations/' + quotationId);
    options.path = settings.purchaseApiPath + '/api/quotations/' + quotationId ;
    processGET(options, req, res);
};

exports.quotationRequestFromId = function (req, res) {
    var options = optionsConfig['purchaseApi'];
    var quotationRequestId = req.params.quotationRequestId;
    if(!quotationRequestId){
        console.log('No quotationRequestId received');
        return;        
    }
    options.path = settings.purchaseApiPath + '/api/quotation-request/' + quotationRequestId ;
    processGET(options, req, res);
};

exports.quotationtopurchaserequest = function (req, res) {
    console.log('quotationtopurchaserequest');
    var options = optionsConfig['purchaseApi'];
    var quotationId = req.params.quotationId;
    if(!quotationId){
        console.log('No quotationId received');
        return;        
    }
    options.path = settings.purchaseApiPath + '/api/quotations/to/purchase-request/' + quotationId ;
    processGET(options, req, res);
};

