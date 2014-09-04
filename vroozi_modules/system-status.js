var fs = require('fs');
var moment = require('moment');
var settings = require('../conf/app_settings.js').settings;

moment().format();

var htmlTemplate;
fs.readFile('vroozi_modules/system-status.html', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    htmlTemplate = data;
}); 

exports.controller = function (req, res) {
    var htmlData = htmlTemplate;
    htmlData = htmlData.replace('{{RELEASE}}', settings.release);
    htmlData = htmlData.replace('{{APP_MODE}}', settings.appMode);
    htmlData = htmlData.replace(/{{COMMIT_HASH}}/g, settings.gitHash);
    htmlData = htmlData.replace('{{CURRENT_TIME}}', new Date().getTime());
    htmlData = htmlData.replace('{{STARTUP}}', settings.appStart);
    htmlData = htmlData.replace('{{UPTIME}}', uptime(settings.appStart));
    var startTime = moment(settings.appStart);
    htmlData = htmlData.replace('{{START_TIME}}', startTime.format('MMMM Do YYYY, h:mm:ss a Z'));
    htmlData = htmlData.replace('{{COOKIE_VSD}}', settings.cookieVSD);
    htmlData = htmlData.replace('{{COOKIE_DOMAIN}}', settings.cookieDomain);
    htmlData = htmlData.replace('{{COOKIE_MAX_AGE}}', settings.cookieMaxAge);
    htmlData = htmlData.replace('{{SESSION_TIMEOUT}}', settings.sessionTimeout);

    res.writeHead(200, {'Content-Type': 'text/html','Content-Length':htmlData.length});
    res.write(htmlData);
    res.end();
}

function uptime(startTime) {
    var now = moment();
    var start = moment(startTime);
    var days = now.diff(start, 'days');    
    var hours = Math.floor(now.diff(start, 'hours') % 24);    
    var minutes = Math.floor(now.diff(start, 'minutes') % 60);    
    var seconds = Math.floor(now.diff(start, 'seconds') % 60);    

    var strDays = "";
    if(days > 1) {
        strDays += days + " days ";
    } else if(days == 1) {
        strDays += days + " day ";
    }

    var strHours = "";
    if(hours > 1) {
        strHours += hours + " hours ";
    } else if(hours == 1) {
        strHours += hours + " hour ";
    }
            
    var strMinutes = "";
    if(minutes > 1) {
        strMinutes += minutes + " minutes ";
    } else if(minutes == 1) {
        strMinutes += minutes + " minute ";
    }

    var strSeconds = "";
    if(seconds > 1) {
        strSeconds += seconds + " seconds";
    } else if(seconds == 1) {
        strSeconds += seconds + " second";
    }

    return strDays + strHours + strMinutes + strSeconds;
}

