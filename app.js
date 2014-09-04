/**
 * Module dependencies.
 */
var newrelic  = require('newrelic');
var http = require('http'),
    express = require('express'),
    cons = require('consolidate'),
    fs = require("fs"),

// Our modules
    routes = require('./routes'),
    imageUtils = require('./routes/imageUtils'),
    api = require('./routes/api'),
    prApproval = require('./routes/purchaseRequestApproval'),
    config = require('./conf/app_settings.js').settings,
    clientSession = require('./vroozi_modules/client-session'),
    fileUpload = require('./vroozi_modules/fileupload'),
    contentMedia = require('./routes/content.media');
contentfileUpload = require('./routes/content.fileUpload');

// Set the http protocol to have more than 10 sockets
http.globalAgent.maxSockets = 1000;

var app = module.exports = express();

var argv = require('optimist')
    .usage('Usage: $0 -port [num] -appStart [num] -gitHash [string]')
    .default('port', 3001)
    .default('appStart', new Date().getTime())
    .default('gitHash', '0000000')
    .argv;

var port = argv.port;

// Configuration
app.configure(function () {
    app.set("views", __dirname + '/views');
    app.set('view engine', 'html');
    app.engine("html", cons.underscore);
    app.use(express.cookieParser());
    app.use(express.bodyParser({
        keepExtensions: true,
        limit: 10000000, // 10M bytes limit
        defer: true
    }));
    app.use(express.json());
    app.use(express.static(__dirname + '/public'));
    app.use(function noCachePlease(req, res, next) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        next();
    });

    app.use(app.router);
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// non-VSD pages
app.get('/purchaseRequests/:operation/view/:token', prApproval.approvalView);
app.post('/purchaseRequests/approve', prApproval.approve);

// VSD/VCI controllers --
app.all('*', clientSession.handler);

// Routes
app.get('/login', routes.login);
app.get('/session', routes.session);
app.get('/partials/:name', routes.partials);

// Web Controller REST APIs
app.get('/api/notifications', api.getNotifications);
app.get('/api/companysettings', api.getCompanySettings);
app.put('/api/companysettings', api.updateCompanySettings);

// Get list of items by request id
app.get('/api/purchaseRequests/:requestId/lineItems', api.getLineItems);
app.post('/api/purchaseRequests/:requestId/lineItems/:id', api.createLineItem);
app.put('/api/purchaseRequests/:requestId/lineItems/:id', api.updateLineItem);
app.delete('/api/purchaseRequests/:requestId/lineItems/:id', api.deleteLineItem);

app.get('/api/purchaseRequests/orders', api.getApproverPurchaseRequests);
app.get('/api/purchaseRequests/summary', api.getPurchaseRequestSummary);
app.get('/api/purchaseRequests/summaries', api.getPurchaseRequestSummaries);
app.get('/api/purchaseRequests/export', api.downloadPurchaseRequests);

app.get('/api/purchaseRequests', api.getPurchaseRequests);
app.get('/api/purchaseRequests/:id', api.getPurchaseRequest);
app.post('/api/purchaseRequests', api.createPurchaseRequest);
app.put('/api/purchaseRequests/:id', api.updatePurchaseRequest);
app.delete('/api/purchaseRequests/:id', api.deletePurchaseRequest);

app.get('/api/purchaseRequestsUnDraft/orders', api.getApproverPurchaseRequestsUnDraft);
app.get('/api/purchaseRequestsUnDraft/allorders', api.getApproverAllPurchaseRequestsUnDraft);
app.get('/api/purchaseRequestsUnDraft/status', api.getApproverPurchaseRequestsByStatus);
app.get('/api/purchaseRequestsUnDraft/approver', api.getApproverPurchaseRequestsByApprover);

app.get('/api/purchaseOrders', api.getPurchaseOrders);
app.get('/api/purchaseOrders/:id', api.getPurchaseOrders);

app.post('/api/purchase-orders', api.createPurchaseOrder);
app.put('/api/purchase-orders/:id', api.updatePurchaseOrder);
app.get('/api/purchase-orders/summary', api.getPurchaseOrdersSummary);
app.delete('/api/purchase-orders/:id', api.deletePurchaseOrder);
//app.get('/api/purchase-orders', api.updatePurchaseOrder);

//update PO Items Qty from PR
app.put('/api/purchase-orders-qty/:id', api.updatePurchaseOrdersItemQty);

// Get list of items by request id
app.get('/api/purchase-orders/:orderId/line-items', api.getPurchaseOrderLineItems);
app.post('/api/purchase-orders/:orderId/line-items/:id', api.createPurchaseOrderLineItem);
app.put('/api/purchase-orders/:orderId/line-items/:id', api.updatePurchaseOrderLineItem);
app.delete('/api/purchase-orders/:orderId/line-items/:id', api.deletePurchaseOrderLineItem);

app.post('/api/purchaseRequests', api.createPurchaseRequest);
// Quick Rfx
app.post('/api/quickRfxRequest', api.createQuickRfxRequest);

app.get('/api/purchaseTemplates/:id', api.getPurchaseTemplate);
app.post('/api/purchaseTemplates', api.createPurchaseTemplate);
app.put('/api/purchaseTemplates/:id', api.updatePurchaseTemplate);

app.get('/api/payment-terms',api.getPaymentTerms);

app.post('/api/changePassword', api.changePassword);
app.get('/api/mysettings', api.getMySettings);

app.get('/api/profile', api.getProfile);
app.put('/api/profile', api.putProfile);

app.get('/api/addresses', api.getAddresses);
app.post('/api/addresses', api.addAddress);
app.put('/api/addresses/:id', api.updateAddress);
app.delete('/api/addresses/:id', api.deleteAddress);

app.get('/api/costCenters', api.getCostCenters);
app.post('/api/costCenters', api.addCostCenter);
app.put('/api/costCenters/:id', api.updateCostCenter);
app.delete('/api/costCenters/:id', api.deleteCostCenter);

app.put('/api/defaultCostCenter', api.setDefaultCostCenter);
app.get('/api/defaultCostCenter', api.getDefaultCostCenter);

app.put('/api/defaultShippingAddress', api.setDefaultShippingAddress);
app.get('/api/defaultShippingAddress', api.getDefaultShippingAddress);

app.put('/api/default-company-address', api.setDefaultCompanyAddress);
app.get('/api/default-company-address', api.getDefaultCompanyAddress);



app.put('/api/defaultCurrency', api.setDefaultCurrency);
app.get('/api/defaultCurrency', api.getDefaultCurrency);

app.get('/api/suppliers', api.getSuppliers);
app.get('/api/suppliers/:id', api.getSupplier);
app.post('/api/suppliers', api.createSupplier);
app.put('/api/suppliers', api.updateSupplier);
app.delete('/api/suppliers/:id', api.deleteSupplier);

app.get('/api/suppliers/uniqueid/:id', api.getSupplierByUniqueId);


app.get('/api/countries', api.getCountries);

app.get('/api/uoms', api.getUoms);

app.get('/api/categories', api.getCategories);

app.get('/api/items', api.getItems);
app.get('/api/items/:id', api.getItem);

app.get('/api/users', api.getUsers);
app.get('/api/users/:id', api.getUser);
app.get('/api/users/email/:email', api.findUser);
app.post('/api/users', api.addUser);
app.delete('/api/users/:id', api.deleteUser);
app.put('/api/users', api.updateUser);

app.put('/api/email', api.sendResetEmail);

app.get('/api/organization/roles/:roleids/users', api.getUserRoles);

app.get('/api/contents', api.getContents);
app.delete('/api/contents/:id', api.deleteProductOffer);

app.delete('/api/searchindex/:id', api.deleteFromSearchIndex);

app.post('/api/buyer-groups', api.createBuyerGroup);
app.get('/api/buyer-groups', api.getBuyerGroups);
app.get('/api/buyer-groups/:groupId', api.getBuyerGroupById);
app.put('/api/buyer-groups/:id', api.updateBuyerGroup);
app.delete('/api/buyer-groups/:id', api.deleteBuyerGroup);

app.get('/api/buyer-group', api.getBuyerGroupById)
app.get('/api/buyer-groups-category', api.getBuyerGroupsByCategory);
app.get('/api/default-company-buyer-group', api.getDefaultCompanyBuyerGroup);

app.post('/api/comapanycodes', api.createCompanyCode);
app.get('/api/comapanycodes', api.getCompanyCode);
//app.get('/api/buyer-groups/:id', api.getBuyerGroup);
app.put('/api/comapanycodes/:id', api.updateCompanyCode);
app.delete('/api/comapanycodes/:id', api.deleteCompanyCode);

app.delete('/api/ass-comapanycodes/:id', api.deleteAssCompanyCode);

app.post('/api/materialgroup', api.createMaterialGroup);
app.get('/api/materialgroup', api.getMaterialGroup);
app.put('/api/materialgroup/:id', api.updateMaterialGroup);
app.delete('/api/materialgroup/:id', api.deleteMaterialGroup);

app.post('/api/glaccounts', api.addGLAccount);
app.get('/api/glaccounts', api.getGLAccounts);
app.put('/api/glaccounts/:id', api.updateGLAccount);
app.delete('/api/glaccounts/:id', api.deleteGLAccount);

app.post('/api/quotation-request/:supplierIds', api.addUpdateQuotationRequest);
app.post('/api/quotations', api.createquickquote);
app.get('/api/quotations/:quotationId', api.getQuotation);
app.get('/api/buyRoutesItems', api.getQuickRfxSummary);
app.get('/api/quotation-request/:quotationRequestId', api.quotationRequestFromId);
app.get('/api/quotations/to/purchase-request/:quotationId', api.quotationtopurchaserequest);

app.get('/api/reports/:reportId',function(req,res) {

api.generateReport(req,res);

});

app.get('/api/pdfreports/:purchaseRequestId',function(req,res) {

    api.generatePDF(req,res);

});

app.get('/api/pdfOrderreports/:purchaseOrderId',function(req,res) {

    api.generateOrderPDF(req,res);

});


app.get('/api/acl-controls', api.loadAclControls);

// serve static image resources
app.get(/\/(image|supplier|icons|attachments|reports)\/(.+)/, imageUtils.resolveImagePath);

app.get('/logout', clientSession.destroySession);

app.post('/uploads', fileUpload.deferHandler({"unitLogo": contentMedia.unitLogoHandler}));
app.post('/uploads/supplier-logo', fileUpload.deferHandler({"logo": contentMedia.supplierLogoHandler}));

app.post('/contentuploads', fileUpload.deferHandler({"contentFile": contentfileUpload.postFileUploadHandler}));

// Bootstrap controllers
var controllers_path = __dirname + '/router'
    , controller_files = fs.readdirSync(controllers_path);

controller_files.forEach(function (file) {
    require(controllers_path + '/' + file)(app)
});

// Start server
// redirect all others to the index (HTML5 history)
app.get('/', routes.index);
app.get('*', routes.index);

app.listen(port, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
