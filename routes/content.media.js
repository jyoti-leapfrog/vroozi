var path = require("path");
var fs = require('fs');
var settings = require('../conf/app_settings.js').settings;
var resources = require('../resources/resources');
var gm = require('gm');

exports.unitLogoHandler = function(req, res) {
    var ext;
    req.files.unitLogo.name = req.files.unitLogo.name.split(' ').join('_');
    switch(req.files.unitLogo.type) {
        case "image/png":
            ext = ".png";
            break;
        case "image/jpg":
            ext = ".jpg";
            break;
        case "image/jpeg":
            ext = ".jpg";
            break;
        case "image/gif":
            ext = ".gif";
            break;
        default:
            // if incorrect file format then do nothing
            return;
    }

    var newImageName = 'company-logo-' + req.session.unitId + '-' + new Date().getTime() + ext;
    var newImagePath = path.join(settings.flagIconUploadPath, newImageName);

    gm(req.files.unitLogo.path)
        .resize(190, 37)
        .write(newImagePath, function (err) {
            if (!err) {
                console.log('done');
            }
            if (err) {
                console.log('error: ' + err);
            }
        });

    resources.CompanySettingsByUnitId.get(req.session.unitId,
        function(companySettings, respHeader) {
            companySettings.companyIcon = newImageName;
            resources.CompanySettingsByUnitId.update(companySettings.unitId, companySettings);
        },
        function(error, respHeader) {
            throw "REST API error";
        }
    );

};

exports.supplierLogoHandler = function(req, res) {
    var ext;
    switch(req.files.logo.type) {
        case "image/png":
            ext = ".png";
            break;
        case "image/jpg":
            ext = ".jpg";
            break;
        case "image/jpeg":
            ext = ".jpg";
            break;
        case "image/gif":
            ext = ".gif";
            break;
        default:
            // if incorrect file format then do nothing
            return;
    }

    var newImageName = 'supplier-logo-' + req.session.unitId + '-' + req.body.companyId + '-' + new Date().getTime() + ext;
    var newImagePath = path.join(settings.supplierImagesPath, newImageName);

    gm(req.files.logo.path)
        .resize(135, 70)
        .write(newImagePath, function (err) {
            if (!err) console.log('done');
        });

    resources.GetSupplier.get({unitid:req.session.unitId, supplierid:req.body.companyId},
        function(supplier, respHeader) {
            // success callback
            supplier.logo = 'image/'+ newImageName;
            resources.UpdateSupplier.update('',supplier,
                function(data, respHeader) {
                    // success callback
                    console.log('noop');
                },
                function(error, respHeader) {
                    throw "REST API error";
                }
            );
        },
        function(error, respHeader) {
            throw "REST API error";
        }
    );
};
