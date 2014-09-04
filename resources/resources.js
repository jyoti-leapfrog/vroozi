var settings = require('../conf/app_settings.js').settings;
var resource = require('../vroozi_modules/common').resource;

exports.PurchaseRequests = resource(settings.purchaseApiHost, settings.purchaseApiPort,
    settings.purchaseApiPath + '/api/purchase-requests/:id');

exports.PurchaseRequestsApprovalStatus = resource(settings.purchaseApiHost, settings.purchaseApiPort,
    settings.purchaseApiPath + '/api/purchase-requests/:id/approvalStatus');

exports.Profiles = resource(settings.userDataServiceHost, settings.userDataServicePort,
    settings.userDataServicePath + '/api/users/userId/:id');

exports.CompanySettingsByUnitId = resource(settings.userDataServiceHost, settings.userDataServicePort,
    settings.userDataServicePath + '/api/companysettings/unitid/:id');

exports.Organization = resource(settings.userDataServiceHost, settings.userDataServicePort,
    settings.userDataServicePath + '/api/organizations/:orgId/associations/:id');

exports.UserRoles = resource(settings.userDataServiceHost, settings.userDataServicePort,
    settings.userDataServicePath + '/api/organization/:unitId/roles/:roleIds/users');

// POST / Update Only
exports.UpdateSupplier = resource(settings.userDataServiceHost, settings.userDataServicePort,
    settings.userDataServicePath + '/api/suppliers');

// GET / Read Only
exports.GetSupplier = resource(settings.userDataServiceHost, settings.userDataServicePort,
    settings.userDataServicePath + '/api/company/:unitid/supplier/:supplierid');
