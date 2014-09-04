var settings = require('../conf/app_settings.js').settings;
var path = require("path"),
    url = require("url"),
    filesys = require("fs"),
    mime = require('mime');
var logger = require('../vroozi_modules/log-settings');

exports.getCatalogItemImageUrl = function(imageUrl, catalogId, noImageLogo){
	return exports.getCatalogItemImage(imageUrl, catalogId, noImageLogo, 'thumbnails');
};

exports.getCatalogItemImageUrlMedium = function(imageUrl, catalogId, noImageLogo){
	return exports.getCatalogItemImage(imageUrl, catalogId, noImageLogo, 'medium');
};

exports.getCatalogItemImageUrlLarge = function(imageUrl, catalogId, noImageLogo){
	return exports.getCatalogItemImage(imageUrl, catalogId, noImageLogo, 'large');
};

exports.getCatalogItemImage = function(imageUrl, catalogId, noImageLogo, type){
	if(imageUrl && imageUrl.length>0 && imageUrl.indexOf('http') == -1 && imageUrl.indexOf('www') == -1){
		imageUrl = '/image/'+type+'/'+catalogId+'/'+ imageUrl;
    } else if(!imageUrl && noImageLogo){
        imageUrl = exports.getIconUrl(noImageLogo);
    }
	return imageUrl;
};

exports.getSupplierImageUrl = function(imageUrl){
	if(imageUrl && imageUrl.length>0 && imageUrl.indexOf('http') == -1 && imageUrl.indexOf('www') == -1 && (imageUrl.indexOf('jpg') != -1 || imageUrl.indexOf('jpeg') != -1 || imageUrl.indexOf('gif') != -1 || imageUrl.indexOf('png') != -1 || imageUrl.indexOf('tif') != -1 || imageUrl.indexOf('bmp') != -1)){
		imageUrl = '/supplier/'+path.basename(imageUrl);
        return imageUrl;
    }
	return "";
};

exports.getIconUrl = function(iconUrl){
	if(iconUrl && iconUrl.length>0 && iconUrl.indexOf('http') == -1 && iconUrl.indexOf('www') == -1){
		iconUrl = '/icons/'+iconUrl;
    }
	return iconUrl;
};

exports.resolveImagePath = function(req,res) {
    //console.log("Trying to resolve image path... " + req.path);
    exports.download(req,res);
};

exports.download = function(req,res){
    var resourcePath = url.parse(req.path).pathname;
    var root = resourcePath.match(/\/(image|supplier|icons|attachments|reports)\//)[0];

    var filePath = resourcePath.substring(root.length);
    filePath = decodeURIComponent(filePath)
    filePath = path.normalize(filePath);
    var filename = path.basename(filePath);
    var mimetype = mime.lookup(filePath);

    if(root == '/icons/') {
        filePath = path.resolve(path.normalize(settings.flagIconUploadPath), filePath)
    } else if(root == '/image/') {
        filePath = path.resolve(path.normalize(settings.itemImagesPath), filePath);
    }else if(root == '/supplier/') {
        filePath = path.resolve(path.normalize(settings.supplierImagesPath), filePath);
    } else if(root == '/attachments/') {
        filePath = path.resolve(path.normalize(settings.itemAttachmentsPath), filePath);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    } else if(root == '/reports/') {
        filePath = path.resolve(path.normalize(settings.reportsFilePath), filePath);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    }
    logger.debug(filePath);

//	var fullPath = path.join(process.cwd(),filePath);


        if ((root == '/image/' || root == '/supplier/') && filePath.indexOf(".jpg") == -1 && filePath.indexOf(".jpeg") == -1 && filePath.indexOf(".png") == -1
            && filePath.indexOf(".gif") == -1 && filePath.indexOf(".tif") == -1 && filePath.indexOf(".bmp") == -1) {

            var imgPath;

            if (root == '/image/') {
                imgPath = settings.itemImagesPath;
            } else if (root == '/supplier/') {
                imgPath = settings.supplierImagesPath;
            }

            path.exists(filePath + ".jpg", function (exists) {
                if (exists) {
                    filePath = path.resolve(path.normalize(imgPath), filePath) + ".jpg";
                    filesys.readFile(filePath, "binary", function (err, file) {
                        if (err) {
                            res.writeHeader(500, {"Content-Type": "text/plain"});
                            res.write(err + "\n");
                            res.end();
                        }
                        else {
                            res.setHeader('Content-type', mimetype);
                            res.writeHeader(200);
                            res.write(file, "binary");
                            res.end();

                        }

                    });
                } else {
                    path.exists(filePath + ".png", function (exists) {
                        if (exists) {
                            filePath = path.resolve(path.normalize(imgPath), filePath) + ".png";
                            filesys.readFile(filePath, "binary", function (err, file) {
                                if (err) {
                                    res.writeHeader(500, {"Content-Type": "text/plain"});
                                    res.write(err + "\n");
                                    res.end();
                                }
                                else {
                                    res.setHeader('Content-type', mimetype);
                                    res.writeHeader(200);
                                    res.write(file, "binary");
                                    res.end();

                                }

                            });
                        } else {
                            path.exists(filePath + ".gif", function (exists) {
                                if (exists) {
                                    filePath = path.resolve(path.normalize(imgPath), filePath) + ".gif";
                                    filesys.readFile(filePath, "binary", function (err, file) {
                                        if (err) {
                                            res.writeHeader(500, {"Content-Type": "text/plain"});
                                            res.write(err + "\n");
                                            res.end();
                                        }
                                        else {
                                            res.setHeader('Content-type', mimetype);
                                            res.writeHeader(200);
                                            res.write(file, "binary");
                                            res.end();

                                        }

                                    });
                                } else {
                                    path.exists(filePath + ".tif", function (exists) {
                                        if (exists) {
                                            filePath = path.resolve(path.normalize(imgPath), filePath) + ".tif";
                                            filesys.readFile(filePath, "binary", function (err, file) {
                                                if (err) {
                                                    res.writeHeader(500, {"Content-Type": "text/plain"});
                                                    res.write(err + "\n");
                                                    res.end();
                                                }
                                                else {
                                                    res.setHeader('Content-type', mimetype);
                                                    res.writeHeader(200);
                                                    res.write(file, "binary");
                                                    res.end();

                                                }

                                            });
                                        } else {
                                            path.exists(filePath + ".bmp", function (exists) {
                                                if (exists) {
                                                    filePath = path.resolve(path.normalize(imgPath), filePath) + ".bmp";
                                                    filesys.readFile(filePath, "binary", function (err, file) {
                                                        if (err) {
                                                            res.writeHeader(500, {"Content-Type": "text/plain"});
                                                            res.write(err + "\n");
                                                            res.end();
                                                        }
                                                        else {
                                                            res.setHeader('Content-type', mimetype);
                                                            res.writeHeader(200);
                                                            res.write(file, "binary");
                                                            res.end();

                                                        }

                                                    });
                                                } else {
                                                    path.exists(filePath + ".jpeg", function (exists) {
                                                        if (exists) {
                                                            filePath = path.resolve(path.normalize(imgPath), filePath) + ".jpeg";
                                                            filesys.readFile(filePath, "binary", function (err, file) {
                                                                if (err) {
                                                                    res.writeHeader(500, {"Content-Type": "text/plain"});
                                                                    res.write(err + "\n");
                                                                    res.end();
                                                                }
                                                                else {
                                                                    res.setHeader('Content-type', mimetype);
                                                                    res.writeHeader(200);
                                                                    res.write(file, "binary");
                                                                    res.end();

                                                                }

                                                            });
                                                        } else {
                                                            res.writeHeader(404, {"Content-Type": "text/plain"});
                                                            res.write("404 Not Found\n");
                                                            res.end();
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {

            path.exists(filePath, function (exists) {
                if (!exists) {
                    res.writeHeader(404, {"Content-Type": "text/plain"});
                    res.write("404 Not Found\n");
                    res.end();
                }
                else {
                    filesys.readFile(filePath, "binary", function (err, file) {
                        if (err) {
                            res.writeHeader(500, {"Content-Type": "text/plain"});
                            res.write(err + "\n");
                            res.end();
                        }
                        else {
                            res.setHeader('Content-type', mimetype);
                            res.writeHeader(200);
                            res.write(file, "binary");
                            res.end();
                        }
                    });
                }
            });
        }

}

