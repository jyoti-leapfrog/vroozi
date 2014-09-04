var path = require("path");
var fs = require('fs');
var mv = require('mv');
var settings = require('../conf/app_settings.js').settings;
var resources = require('../resources/resources');
var api = require('./api.js');


exports.postFileUploadHandler = function (req, res) {
    var ext;
    var extImage;
    var newImageFileName;
    var newImageFilePath;
    console.log(req.files.contentFile.type);
    switch (req.files.contentFile.type) {
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            ext = ".xlsx";
            break;
        case "text/csv":
            ext = ".csv";
            break;
//        case "image/jpeg":
//            ext = ".jpg";
//            break;
//        case "image/gif":
//            ext = ".gif";
//            break;
        default:
            // if incorrect file format then do nothing
            return;
    }


    var newFileName = 'content-file-' + req.session.unitId + '-' + new Date().getTime() + ext;
    var newFilePath = path.join(settings.contentFileUploadPath, newFileName);

    mv(req.files.contentFile.path, newFilePath, function(err) {
        console.log(err);
    });

    if (typeof req.files.imageFile!=undefined && req.files.imageFile && req.files.imageFile.name) {
        console.log(req.files.imageFile.type);
        switch (req.files.imageFile.type) {
            case "application/zip":
                extImage = ".zip";
                break;
            default:
                // if incorrect file format then do nothing
                break;
        }

        if (typeof extImage != undefined && extImage) {
            newImageFileName = 'image-file-' + req.session.unitId + '-' + new Date().getTime() + extImage;
            newImageFilePath = path.join(settings.contentFileUploadPath, newImageFileName);

            mv(req.files.imageFile.path, newImageFilePath, function(err) {
                console.log(err);
            });
        }

    }

    api.initiateTransaction(req, res, {'catalogName': req.body.groupName, 'supplierId': req.body.supplierId, "catalogSourcePath": newFilePath, "catalogImagesPath":newImageFilePath, "catalogOrigin": "1", "catalogSubmitter": "1", "unitId": req.session.unitId});

};
