'use strict';

service.factory('Uoms', function($rootScope) {
    var uomsService = {};

    var uomsList = [
        { isoCode: 'EA', isoTxt: 'Each' },
        { isoCode: 'PCE',isoTxt: 'Piece'},
        { isoCode: 'HR', isoTxt: 'Hour' },
        { isoCode: 'BX', isoTxt: 'Box'  },
        { isoCode: 'T', isoTxt: 'Thousand-ES only'},
        { isoCode: 'TC', isoTxt: 'Truck load'},
        { isoCode: 'TH', isoTxt: 'Thousand'},
        { isoCode: 'TNE', isoTxt: 'Tonne (1000 kg)'},
        { isoCode: 'TU', isoTxt: 'Tube'},
        { isoCode: 'VI', isoTxt: 'Vial'},
        { isoCode: 'VLT', isoTxt: 'Volt'},
        { isoCode: 'WEE', isoTxt: 'Week'},
        { isoCode: 'WK', isoTxt: 'Week'},
        { isoCode: 'WTT', isoTxt: 'Watt'},
        { isoCode: 'YD', isoTxt: 'Yard'},
        { isoCode: 'YDK', isoTxt: 'Square Yard'},
        { isoCode: 'YDQ', isoTxt: 'Cubic yard'},
        { isoCode: 'YR', isoTxt: 'Year'},
        { isoCode: 'YRD', isoTxt: 'Yards'}

    ];
    var performanceUOMList = [
        { isoCode: 'DAY', isoTxt: 'DAY' },
        { isoCode: 'WEE',isoTxt: 'WEEK'},
        { isoCode: 'MON', isoTxt: 'MONTH' },
        { isoCode: 'ANN', isoTxt: 'ANNUAL'  }
        ];

    uomsService.list = function(type, callbackFunction) {

        if(angular.isDefined(callbackFunction)) {
            if(type === 'performanceUOMList'){
                uomsList = performanceUOMList;
                callbackFunction(performanceUOMList);
            }else{
                callbackFunction(uomsList);
            }
        }

        return uomsList;

    };

    return uomsService;
});