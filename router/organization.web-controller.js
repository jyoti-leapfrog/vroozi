var resources = require('../resources/resources');
var settings = require('../conf/app_settings.js').settings;
var logger   = require('../vroozi_modules/log-settings');
var http     = require('http');

module.exports = function(app){
    app.get('/api/organization',function(req, res){
        resources.Organization.get({orgId:req.session.unitId},
            function(data, respHeader) {
                logger.debug(data);
                res.send(data);
            },
            function(error, respHeader) {
                throw "REST API error";
            }
        );
    });
    app.delete('/api/organization/:id',function(req, res){
        resources.Organization.delete({orgId:req.session.unitId,id:req.params.id},
            function(data, respHeader) {
                logger.debug(data);
                res.send(data);
            },
            function(error, respHeader) {
                throw "REST API error";
            }
        );
    });

    app.post('/api/organization',function(req, res){
        var unitId = req.session.unitId;
        req.body.organizationUnitId = unitId;
        req.body.delete = false;

        var options = {
            host: settings.userDataServiceHost,
            port: settings.userDataServicePort,
            path: settings.userDataServicePath+'/api/organizations/'+unitId +'/associations',
            headers: { "content-type" : "application/json" },
            method: 'POST'
        };

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request item saved.' + str);
                res.end(str);
            });

            response.on('error', function(e) {
                logger.error('Error while saving new item. '+e);
            });
        });

        console.log('associate: ' + JSON.stringify(req.body));
        request.write(JSON.stringify(req.body));

        request.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        request.end();
    });

    app.put('/api/organization',function(req, res){
        var unitId = req.session.unitId;
        req.body.organizationUnitId = unitId;
        req.body.delete = false;

        var options = {
            host: settings.userDataServiceHost,
            port: settings.userDataServicePort,
            path: settings.userDataServicePath+'/api/organizations/'+unitId +'/associations',
            headers: { "content-type" : "application/json" },
            method: 'PUT'
        };

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                logger.debug(' purchase request item saved.' + str);
                res.end(str);
            });

            response.on('error', function(e) {
                logger.error('Error while saving new item. '+e);
            });
        });

        console.log('associate: ' + JSON.stringify(req.body));
        request.write(JSON.stringify(req.body));

        request.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        request.end();
    });

};
