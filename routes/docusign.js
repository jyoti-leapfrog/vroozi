'use strict';
var async = require("async"),   
request = require("request"),
// nodemailer = require('nodemailer'),
fs = require('fs')


// create reusable transport method (opens pool of SMTP connections)
// var smtpTransport = nodemailer.createTransport("SMTP",{
//     service: "Gmail",
//     auth: {
//         user: "",  //set username
//         pass: "" //set password
//     }
// });

var api = {

    initialize : function initializefn (req, res, next) {

        var data = {
            email : "jyotichettri@lftechnology.com",    
            password : "password",  // your account password
            integratorKey : "LIKE-52e2d96c-1cf4-4776-aac1-63dd525a5036",    // your account Integrator Key (found on Preferences -> API page)
            recipientName : req.session.username, // recipient (signer) name
            recipientEmail : "jyotichhetri01@gmail.com", // recipient (signer) email
            templateId : "5BB0BB4E-F198-40BB-A432-2A7960D81EA4",    // provide valid templateId from a template in your account
            templateRoleName : "***",   // template role that exists on template referenced above
            baseUrl : "",   // we will retrieve this
            envelopeId : "",    // created from step 2
            documentName : "public/uploads/" + req.uploadedfile
        };

        req.data = data;
        next();
    },
    
    sendTemplate : function sendTemplatefn(req, httpsRes, next) {
        var data = req.data;
    
        async.waterfall(
        [
            // Step 1 - Login (used to retrieve accountId and baseUrl)
            function(next) {
                var url = "https://demo.docusign.net/restapi/v2/login_information";
                var body = "";  // no request body for login api call
                // set request url, method, body, and headers
                var options = initializeRequest(url, "GET", body, data.email, data.password, data.integratorKey);
                console.log("\r\nRequest: \r\n", options);

                // send the request...
                request(options, function(err, res, body) {
                    if(!parseResponseBody(err, res, body)) {
                        return;
                    }
                    data.baseUrl = JSON.parse(body).loginAccounts[0].baseUrl;
                    next(null); // call next function
                });
            },

            // Step 2 - Send envelope with one Embedded recipient (using clientUserId property)
            function(next) {
                var url = data.baseUrl + "/envelopes";

                var body = {
                    "recipients": {
                        "signers": [{
                            "email": data.email,
                            "name": data.recipientName,
                            "recipientId": 1,
                            "clientUserId": "1001",     //Required for embedded recipient
                            "tabs": {
                                "signHereTabs": [{
                                    "xPosition": "100",
                                    "yPosition": "600",
                                    "documentId": "1",
                                    "pageNumber": "2"                                                                                   
                                }]
                            }
                        }]
                    },
                    "emailSubject": 'DocuSign API - Signature Request on Document Call',
                    "documents": [{
                        "name": data.documentName,
                        "documentId": 1,
                    }],
                    "status": "sent"
                };

                // set request url, method, body, and headers
                var options = initializeRequest(url, "POST", body, data.email, data.password, data.integratorKey);

                // change default Content-Type header from "application/json" to "multipart/form-data"
                options.headers["content-type"] = "multipart/form-data";

                // configure a multipart http request with JSON body and document bytes
                options.multipart = [{
                            "Content-Type": "application/json",
                            "Content-Disposition": "form-data",
                            "body": JSON.stringify(body),
                        }, {
                            "Content-Type": "application/pdf",
                            'Content-Disposition': 'file; filename="' + data.documentName + '"; documentId=1',
                            "body": fs.readFileSync(data.documentName),
                        }
                ];

                console.log("\r\nRequest: \r\n", options);

                // send the request...
                request(options, function(err, res, body) {
                    if(!parseResponseBody(err, res, body)) {
                        return;
                    }
                    // parse the envelopeId value from the response
                    data.envelopeId = JSON.parse(body).envelopeId;
                    next(null); // call next function
                });
            },

            // Step 3 - Get the Embedded Signing View (aka the recipient view)
            function(next) {
                var url = data.baseUrl + "/envelopes/" + data.envelopeId + "/views/recipient";
                var method = "POST";
                var body = JSON.stringify({
                "returnUrl": "http://www.docusign.com/devcenter",
                "authenticationMethod": "email",    
                "email": data.email, 
                "userName": data.recipientName,  
                "clientUserId": "1001", // must match clientUserId in step 2!
                });
                // set request url, method, body, and headers
                var options = initializeRequest(url, "POST", body, data.email, data.password, data.integratorKey);
                console.log("\r\nRequest: \r\n", options);

                // send the request...
                request(options, function(err, res, body) {
                    if(!parseResponseBody(err, res, body))
                        return;
                    else
                        body = JSON.parse(body);
                        var templateViewUrl;
                        console.log('xxxxxxxxxxxxxxxxxxxxx');
                        httpsRes.send(body.url);
                        // req.templateViewUrl = templateViewUrl = body.url;
                        // console.log('xxxxxxxxxxx', res);
                        //response.redirect(templateViewUrl);
                        // next();
                    });
            }
            // ,

            // function(res){
            //     console.log('xxxxxxxxxxxxx');
            //     res.redirect('https://demo.docusign.net/Member/StartInSession.aspx?t=ae2d883d-3185-4bf7-8f4c-00874c8c01a3');
            // }

            // function(){
            //     // setup e-mail data with unicode symbols
            //     var mailOptions = {
            //         from: data.email, // sender address
            //         to: data.recipientEmail, // list of receivers
            //         subject: "DocuSign Test", // Subject line
            //         text: req.templateViewUrl, // plaintext body
            //         html: req.templateViewUrl // html body
            //     }

            //     // send mail with defined transport object
            //     smtpTransport.sendMail(mailOptions, function(error, response){
            //         if(error){
            //             console.log(error);
            //         }else{
            //             console.log("Message sent: " + response.message);
            //         }

            //         smtpTransport.close();
            //     });        
            // }
        ]);
    }
};

module.exports = api;
 
// --- HELPER FUNCTIONS ---
function initializeRequest(url, method, body, email, password, integratorKey) {    
    var options = {
        "method": method,
        "uri": url,
        "body": body,
        "headers": {}
        };
    addRequestHeaders(options, email, password, integratorKey);
    return options;
}
 
function addRequestHeaders(options, email, password, integratorKey) {  
    // JSON formatted authentication header (XML format allowed as well)
    var dsAuthHeader = JSON.stringify({
    "Username": email,
    "Password": password,
    "IntegratorKey": integratorKey  // global
    });

    // DocuSign authorization header
    options.headers["X-DocuSign-Authentication"] = dsAuthHeader;
}
     
function parseResponseBody(err, res, body) {
    console.log("\r\nAPI Call Result: \r\n", JSON.parse(body));
    if( res.statusCode != 200 && res.statusCode != 201) { // success statuses
        console.log("Error calling webservice, status is: ", res.statusCode);
        console.log("\r\n", err);
        return false;
    }
    return true;
}


// ----TEST CODE
if(require.main == module){
    (function(){
        var res = {};
        var req = {};
        var next = console.log;
        req.data = {
            email : "jyotichettri@lftechnology.com",    
            password : "password",  // your account password
            integratorKey : "LIKE-52e2d96c-1cf4-4776-aac1-63dd525a5036",    // your account Integrator Key (found on Preferences -> API page)
            recipientName : "Sambhu", // recipient (signer) name
            recipientEmail : "jyotichhetri01@gmail.com", // recipient (signer) email
            templateId : "5BB0BB4E-F198-40BB-A432-2A7960D81EA4",    // provide valid templateId from a template in your account
            templateRoleName : "***",   // template role that exists on template referenced above
            baseUrl : "",   // we will retrieve this
            envelopeId : "",    // created from step 2
            documentName : "public/uploads/test.pdf"
        };

        api.sendTemplate(req, res, next);


    })();
}


