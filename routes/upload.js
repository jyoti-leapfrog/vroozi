'use strict';

var formidable = require('formidable');
var path = require('path');
var fs = require('fs');

var upload  ={

	upload: function uploadfn (req, res, next) {
		var form = new formidable.IncomingForm();
	    form.parse(req, function(err, fields, files) {
	        // `file` is the name of the <input> field of type `file`
	        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            file_name = old_path.substr(index),
            new_path =  path.join('public', 'uploads', files.file.name);
            fs.readFile(old_path, function(err, data) {
	            fs.writeFile(new_path, data, function(err) {
	                fs.unlink(old_path, function(err) {
	                    if (err) {
	                        res.status(500);
	                        res.json({'success': false});
	                    } else {
	                        var uploadedfile;
	                        req.uploadedfile  = files.file.name;
	                        next();
	                        // res.status(200);
	                        // res.json({'success': true});
	                    }
	                });
	            });
	        });
	    });
	}
};

module.exports = upload;
