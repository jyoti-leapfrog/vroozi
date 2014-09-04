var crypto = require('crypto');
var common = require('../vroozi_modules/common.js');
var settings = require('../conf/app_settings.js').settings;
var logger = require('./log-settings');
var pathsToSkip = [settings.sessionRedirectUrl,settings.webLoginRedirectUrl];

exports.handler = function (req, res, next) {

    // don't process cookie data specific content types
    if(/\.jpg|\.ico|\.png|\.gif|\.js|\.css/.test(req.path) || common.inArray(pathsToSkip, req.path)) {
        next();
        return;
    }

    logger.debug('Request URL: ' + req.method + ':'+req.url);

    if(req.path.indexOf('purchaseRequests/approve') > 0) {
        next();
        return;
    }

    var vciCookieValue = req.cookies[settings.cookieVCI];
    var vci;
    if(typeof vciCookieValue === "undefined") {
        var vciCookieData = {};
        vciCookieData.language = 'eng';
        vciCookieData.locale = 'us';
        vci = vciCookieData;
        res.cookie(settings.cookieVCI, encrypt(JSON.stringify(vciCookieData)), { domain: settings.cookieDomain,maxAge: settings.vciCookieMaxAge, httpOnly: settings.vciCookieHttpOnly });
    } else {
        vci = JSON.parse(decrypt(vciCookieValue));
    }

    var vsdCookieValue = req.cookies[settings.cookieVSD];
    var vsd;
    if(typeof vsdCookieValue === "undefined") {
        logger.debug("Cookie vsd is undefined: ");
        // redirect goes here...
        if(req.headers.accept.indexOf('application/json') > -1){
            res.send(401, "redirectUrl=" + settings.webLoginRedirectUrl);
        }else{
            res.redirect(302, settings.webLoginRedirectUrl);
        }
        return;
    } else {
        if(typeof vsdCookieValue.maxAge != 'undefined') {
            // sometimes an empty cookie is created
            if(req.headers.accept.indexOf('application/json') > -1){
                res.send(401, "redirectUrl=" + settings.webLoginRedirectUrl);
            }else{
                res.redirect(302, settings.webLoginRedirectUrl);
            }
            return;
        }
        vsd = JSON.parse(decrypt(vsdCookieValue));
    }

    logger.debug ('userId: ' + vsd.userId + ' - cgroupToken: ' + vsd.cGroupToken);

    // is this a valid session
    if(! isValidSession(vsd) && !/expiry/.test(req.path)  ) {
        if(req.headers.accept.indexOf('application/json') > -1){
            if(vsd.userType && vsd.userType == "VROOZI_LOGIN"){
                res.send(401, vsd.userType + "redirectUrl=" + settings.sessionExpiryRedirectUrl);
            } else {
                res.send(401);
            }
        } else {
            if(vsd.userType && vsd.userType == "VROOZI_LOGIN"){
                res.redirect(302, settings.sessionExpiryRedirectUrl);
            } else {
                res.redirect(302, settings.sessionExpiryRedirectUrl);
            }
        }

        return;
    }

    // language and locale codes
    if(typeof vci.language === 'undefined' || ! common.inArray(settings.localization.languages, vci.language.toUpperCase()) ) {
        // if no language code property has been defined or it's not supported then default to eng(lish)
        vci.language = 'eng';
    }

    if(typeof vci.locale === 'undefined') {
        vci.locale = 'us';
    }

    // last access
    vsd.lastAccess = new Date().getTime();
    res.cookie(settings.cookieVSD, encrypt(JSON.stringify(vsd)), { domain: settings.cookieDomain, maxAge: settings.vsdCookieMaxAge, httpOnly: settings.vsdCookieHttpOnly });
    logger.debug ('vsd is: ' + JSON.stringify(vsd));

    // update session properties
    req.session = {};
    var propt;
    for(propt in vsd) {
        req.session['' + propt] = vsd[propt];
    }
    for (propt in vci) {
        req.session['' + propt] = vci[propt];
    }

    logger.debug('UnitId from session: ' + req.session.unitId);
    logger.debug('Sap User: ' + (req.session.userType == "CLIENT_LOGIN"));

    // call requested web controller
    next();
}

exports.destroySession = function(req, res) {
    res.cookie(settings.cookieVSD,'',{ domain: settings.cookieDomain, maxAge: 0, expires: new Date(1), path: settings.cookieDomain });
    res.cookie(settings.cookieVCI,'',{ domain: settings.cookieDomain, maxAge: 0, expires: new Date(1), path: settings.cookieDomain });
    res.redirect(302, settings.webLoginRedirectUrl);
};

function isValidSession(vsd) {
    // check session age
    var lastAccess = Number(vsd.lastAccess);
    if(isNaN(lastAccess)) {
        return false;
    }
    var sessionAge = new Date().getTime() - lastAccess;
    // console.log('session age: ' + sessionAge);
    if(sessionAge > settings.sessionTimeout) {
        // session expired
        return false;
    }
    return true;
}

function encrypt(text) {
    var cipher = crypto.createCipher('aes-128-ecb', settings.cookieEncryptionKey);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(crypted) {
    var decipher = crypto.createDecipher('aes-128-ecb', settings.cookieEncryptionKey);
    var dec = decipher.update(crypted,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

