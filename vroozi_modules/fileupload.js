// todo: I don't think this is used by anything

exports.deferHandler = function(callbacks) {
    return function(req, res) {
        req.form.on('progress', function(bytesReceived, bytesExpected) {
            console.log(((bytesReceived / bytesExpected)*100) + "% uploaded");
        });
        req.form.on('end', function() {
            console.log(req.files);
            for(file in req.files) {
                if(req.files.hasOwnProperty(file)) {
                    if(callbacks && callbacks[file]) {
                        callbacks[file](req, res);
                    }
                }
            }
            res.send("ok");
        });
    };
};

exports.handler = function(req, res) {
    if (req.files.length == 0 || req.files.file.size == 0) {
        fileUploadMessage = 'No file uploaded at ' + new Date().toString();
    } else {
        var file = req.files.file;
        fs.unlink(file.path, function (err) {
            if (err)
                throw err;
            else
            {
                fileUploadMessage = '<b>"' + file.name + '"<b> uploaded to the server at ' + new Date().toString();
                pictureUrl = '/public/uploads/' + file.name;

                var responseObj = {
                    fullname: req.param('fullname'),
                    gender: req.param('gender'),
                    color: req.param('color'),
                    pictureUrl: pictureUrl
                }

                res.send(JSON.stringify(responseObj));
            }
        });
    }
};
