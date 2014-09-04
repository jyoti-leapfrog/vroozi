var http = require('http');
var m = require("mustache");
var fs = require("fs");
var path = require("path");

/*
 * Checks to see if an item exists within an array
 */
//exports.inArrayOld = function (arr, obj) {
//    for(var i=0; i<arr.length; i++) {
//        if (arr[i] == obj) return true;
//    }
//    return false;
//};


exports.inArray =function(arrValues, obj) {
    arrValues.sort();

    var returnObj = binarySearch(arrValues, obj);
    if(returnObj!=null){
        return true;
    }else{
        return false;
    }
}
// binary search..
function binarySearch( sortedValues, target ){
    // summary:
    //    Performs a binary search on an array of sorted
    //    values for a specified target.
    // sortedValues: Array
    //    Array of values to search within.
    // target: String|Number
    //    Item to search for, within the sortedValues array.
    // returns:
    //    Number or null. The location of the target within
    //    the sortedValues array, if found. Otherwise returns
    //    null.

    // define the recursive function.
    function search( low, high ) {
        // If the low index is greater than the high index,
        //  return null for not-found.
        if ( low > high ) {
            return null;
        }

        // If the value at the low index is our target, return
        //  the low index.
        if ( sortedValues[low] === target ){
            return low;
        }

        // If the value at the high index is our target, return
        //  the high index.
        if ( sortedValues[high] === target ){
            return high;
        }

        // Find the middle index and median element.
        var middle = Math.floor( ( low + high ) / 2 );
        var middleElement = sortedValues[middle];

        // Recursive calls, depending on whether or not the
        //  middleElement is less-than or greater-than the
        //  target.
        // Note: We can use high-1 and low+1 because we've
        //  already checked for equality at the high and low
        //  indexes above.
        if ( middleElement > target ) {
            return search(low+1, middle);
        } else if ( middleElement < target ) {
            return search(middle, high-1);
        }

        // If middleElement === target, we can return that value.
        return middle;
    }

    // Start our search between the first and last elements of
    //  the array.
    return search(0, sortedValues.length-1);
}


/**
 * Example Usages
 *
 * var serviceAggregator = require('../vroozi_modules/common').serviceAggregator;
 *
 * // user defined aggregator function
 * exports.myServiceAggregator = function(req, res) {
 *     // my sequenced service requests
 *     serviceAggregator(req, res, [
 *         {service: getProfile},
 *         {mapper:  setShippingAddress},
 *         {service: putProfile}
 *     ]);
 * };
 *
 * @param httpReq
 * @param httpRes
 * @param serviceFlow
 */

exports.serviceAggregator = function(httpReq, httpRes, serviceFlow) {
    var index = 0;
    var req = {};
    var res = {};
    req.body = httpReq.body;
    req.session = httpReq.session;

    httpReq.sa = {};

    processNext = function(result) {
        index += 1;
        if(typeof result == 'undefined') {
            result = '{}';
        }

        if(index == serviceFlow.length) {
            httpRes.end(result);
            return;
        }

        var flow = serviceFlow[index];

        if(typeof result == 'string') {
            req.body = JSON.parse(result);
        } else {
            req.body = result;
        }

        if(typeof flow.service != 'undefined') {
            flow.service(req, res);
        } else if(typeof flow.mapper != 'undefined') {
            flow.mapper(httpReq, httpRes, req, res);
        } else {
            throw "Invalid service aggregator flow type, index: " + index;
        }
    };

    res.json = function(result) {
        processNext(result);
    };

    res.end = function(result) {
        processNext(result);
    };

    res.send = function(code, message) {
        throw "Error: " + message + " [" + code + "]"
    };

    var flow = serviceFlow[index];
    if(typeof flow.service != 'undefined') {
        flow.service(req, res);
    } else if(typeof flow.mapper != 'undefined') {
        flow.mapper(httpReq, httpRes, req, res);
    } else {
        throw "Invalid service aggregator flow type, index: " + index;
    }
};


//exports.serviceAggregator = function(httpReq, httpRes, serviceFlow) {
//    var index = 0;
//    var req = {};
//    var res = {};
//    var bodyProps = httpReq.body;
//    var params = {};
//    var session = {};
//
//    req.session = httpReq.session;
//
//    if(! httpReq.sa) {
//        httpReq.sa = {};
//    }
//
//    processNext = function(result) {
//        index += 1;
//        if(typeof result == 'undefined') {
//            result = '{}';
//        }
//
//        if(index == serviceFlow.length) {
//            httpRes.end(result);
//            return;
//        }
//
//        var flow = serviceFlow[index];
//
//        if(typeof result == 'string' && result.indexOf('{') != -1 && result.indexOf('}') != -1) {
//            req.body = JSON.parse(result);
//        } else if (typeof result == 'string') {
//            req.body = {};
//        } else {
//            req.body = result;
//        }
//
//        // if custom request body properties were defined add them to each service invocation
//        for(propt in bodyProps) {
//            if(bodyProps.hasOwnProperty(propt)) {
//                req.body['' + propt] = bodyProps[propt];
//            }
//        }
//
//        // if custom request parameters were defined add them to each service invocation
//        req.params = {};
//        for(propt in params) {
//            if(params.hasOwnProperty(propt)) {
//                req.params['' + propt] = params[propt];
//            }
//        }
//
//        // if custom request session properties were defined add them to each service invocation
//        req.session = {};
//        for(propt in session) {
//            if(session.hasOwnProperty(propt)) {
//                req.session['' + propt] = session[propt];
//            }
//        }
//
//        if(typeof flow.body != 'undefined') {
//            bodyProps = flow.body;
//            res.end(req.body);
//        } else if(typeof flow.params != 'undefined') {
//            params = flow.params;
//            res.end(req.body);
//        } else if(typeof flow.session != 'undefined') {
//            session = flow.session;
//            res.end(req.body);
//        } else if(typeof flow.service != 'undefined') {
//            flow.service(req, res);
//        } else if(typeof flow.mapper != 'undefined') {
//            flow.mapper(httpReq, httpRes, req, res);
//        } else {
//            throw "Invalid service aggregator flow type, index: " + index;
//        }
//    };
//
//    res.json = function(result) {
//        processNext(result);
//    };
//
//    res.end = function(result) {
//        processNext(result);
//    };
//
//    res.send = function(code, message) {
//        throw "Error: " + message + " [" + code + "]"
//    };
//
//    var flow = serviceFlow[index];
//    if(typeof flow.body != 'undefined') {
//        bodyProps = flow.body;
//        res.end({});
//    } else if(typeof flow.params != 'undefined') {
//        params = flow.params;
//        res.end({});
//    } else if(typeof flow.session != 'undefined') {
//        session = flow.session;
//        res.end({});
//    } else if(typeof flow.service != 'undefined') {
//        flow.service(req, res);
//    } else if(typeof flow.mapper != 'undefined') {
//        flow.mapper(httpReq, httpRes, req, res);
//    } else {
//        throw "Invalid service aggregator flow type, index: " + index;
//    }
//};

exports.isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

var pages = {};
exports.renderPage = function(httpRes, pageName, data) {
    if(! pages[pageName]) {
        // load page from views directory
        var inputFilePath = path.join("views", pageName + ".html");
        pages[pageName] = fs.readFileSync(inputFilePath, "utf8");
    }
    var html = m.render(pages[pageName], data);
    httpRes.writeHead(200, {'Content-Type': 'text/html'});
    httpRes.end(html);
};

exports.resource = function(host, port, url, paramDefaults, actions) {
    var api = {};
    api.url = url;
    api.paramDefaults = paramDefaults;

    // common
    var createPath = function(url, param) {
        // replace all parameters where a value was provided
        if(typeof param == 'object') {
            for(propt in param) {
                if(param.hasOwnProperty(propt)) {
                    url = url.replace(':' + propt, param[propt]);
                }
            }
        } else if(typeof param == 'string' || typeof param == 'number' || typeof param == 'boolean') {
            url = url.replace(':id', param);
        } else {
            // error
        }

        // strip out all parameters that didn't have a value
        url = url.replace(/:[a-zA-Z0-9\-_]+[^:\/]/,'');

        // strip trailing slashes and set the url
        url = url.replace(/\/+$/, '');
        // then replace collapse `/.` if found in the last URL path segment before the query
        // E.g. `http://url.com/id./format?q=x` becomes `http://url.com/id.format?q=x`
        url = url.replace(/\/\.(?=\w+($|\?))/, '.');
        // replace escaped `/\.` with `/.`
        url = url.replace(/\/\\\./, '/.');

        //url = url.replace(/{2,}/, '/.');


        // strip out double or trailing /
        return url;
    };

    // default actions
    var get = function(param, success, failure) {
        var options = {
            host: host,
            port: port,
            path: createPath(url, param),
            method: 'GET',
            headers: {'accept': 'application/json'}
        };

        var restReq = http.request(options);
        var result = '';

        restReq.on('response', function(response) {
            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                result += chunk;
            });

            response.on('end', function() {
                var json;
                if (typeof success != 'undefined') {
                    if (typeof result == 'string' && result.indexOf('{') != -1 && result.indexOf('}') != -1) {
                        result = JSON.parse(result);
                    }
                    // todo: attach $save() method
                    success(result, this);
                }
            });

            response.on('error', function(error) {
                if(typeof failure != 'undefined') {
                    failure(error, this);
                }
            });
        });

        restReq.on('error', function(error) {
            failure(error);
        });

        restReq.end();

        return result;
    };

    var put = function(param, data, success, failure) {
        var jsonObject = JSON.stringify(data);

        var options = {
            host: host,
            port: port,
            path: createPath(url, param),
            method: 'PUT',
            headers: {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
            }
        };

        var restReq = http.request(options);
        var result = '';

        restReq.on('response', function(response) {
            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                result += chunk;
            });

            response.on('end', function() {
                var json;
                if (typeof success != 'undefined') {
                    if (typeof result == 'string' && result.indexOf('{') != -1 && result.indexOf('}') != -1) {
                        result = JSON.parse(result);
                    }
                    // todo: attach $save() method
                    success(result, this);
                }
            });

            response.on('error', function(error) {
                if(typeof failure != 'undefined') {
                    failure(error, this);
                }
            });
        });

        restReq.on('error', function(error) {
            failure(error);
        });

        restReq.write(jsonObject);

        restReq.end();

        return result;
    };

//    var put = function(param, data, success, failure) {
//        var jsonObject = JSON.stringify(data);
//
//        var options = {
//            host: host,
//            port: port,
//            path: createPath(url, param),
//            method: 'PUT',
//            headers: {
//                'Content-Type' : 'application/json',
//                'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
//            }
//        };
//
//        var restReq = http.request(options);
//        var result = '';
//
//        restReq.on('response', function(response) {
//            response.setEncoding('utf8');
//            response.on('data', function(chunk) {
//                result += chunk;
//            });
//
//            response.on('end', function() {
//                var json;
//                if (typeof success != 'undefined') {
//                    if (typeof result == 'string' && result.indexOf('{') != -1 && result.indexOf('}') != -1) {
//                        result = JSON.parse(result);
//                    }
//                    // todo: attach $save() method
//                    success(result, this);
//                }
//            });
//
//            response.on('error', function(error) {
//                if(typeof failure != 'undefined') {
//                    failure(error, this);
//                }
//            });
//        });
//
//        restReq.on('error', function(error) {
//            failure(error);
//        });
//
//        restReq.write(jsonObject);
//
//        restReq.end();
//
//        return result;
//    };


    var del = function(param, data, success, failure) {
        var options = {
            host: host,
            port: port,
            path: createPath(url, param),
            method: 'DELETE',
            headers: {
                'Content-Type' : 'application/json'
            }
        };
            ///userDataService/api/organizations/1001/associations/organizations/1001/associations/51a68fa7ed72429ba185bac8

        var request = http.request(options, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                //logger.debug(' purchase request item saved.' + str);
                //var json;
                if (typeof success != 'undefined') {
                    success(str, this);
                }
            });

            response.on('error', function (e) {
                logger.error('Error while saving new item. ' + e);
                if(typeof failure != 'undefined') {
                    failure(error, this);
                }
            });
        });

        request.on('error', function(error) {
            failure(error);
        });

        request.end();
    };

    // attach default actions
    api.get = get;
    api.update = put;
    api.delete = del;

    return api;
};
