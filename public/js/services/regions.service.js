'use strict';


// This service return supported regions e.g. US states
// Ref: http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
service.factory('Regions', function($rootScope) {
    var regionsService = {};

    var countryRegions = {
        'US': [
            {'code': 'AL', 'common': 'Alabama'},
            {'code': 'AK', 'common': 'Alaska'},
            {'code': 'AZ', 'common': 'Arizona'},
            {'code': 'AR', 'common': 'Arkansas'},
            {'code': 'CA', 'common': 'California'},
            {'code': 'CO', 'common': 'Colorado'},
            {'code': 'CT', 'common': 'Connecticut'},
            {'code': 'DE', 'common': 'Delaware'},
            {'code': 'DC', 'common': 'District of Columbia'},
            {'code': 'FL', 'common': 'Florida'},
            {'code': 'GA', 'common': 'Georgia'},
            {'code': 'HI', 'common': 'Hawaii'},
            {'code': 'ID', 'common': 'Idaho'},
            {'code': 'IL', 'common': 'Illinois'},
            {'code': 'IN', 'common': 'Indiana'},
            {'code': 'IA', 'common': 'Iowa'},
            {'code': 'KS', 'common': 'Kansas'},
            {'code': 'KY', 'common': 'Kentucky'},
            {'code': 'LA', 'common': 'Louisiana'},
            {'code': 'ME', 'common': 'Maine'},
            {'code': 'MT', 'common': 'Montana'},
            {'code': 'NE', 'common': 'Nebraska'},
            {'code': 'NV', 'common': 'Nevada'},
            {'code': 'NH', 'common': 'New Hampshire'},
            {'code': 'NJ', 'common': 'New Jersey'},
            {'code': 'NM', 'common': 'New Mexico'},
            {'code': 'NY', 'common': 'New York'},
            {'code': 'NC', 'common': 'North Carolina'},
            {'code': 'ND', 'common': 'North Dakota'},
            {'code': 'OH', 'common': 'Ohio'},
            {'code': 'OK', 'common': 'Oklahoma'},
            {'code': 'OR', 'common': 'Oregon'},
            {'code': 'MD', 'common': 'Maryland'},
            {'code': 'MA', 'common': 'Massachusetts'},
            {'code': 'MI', 'common': 'Michigan'},
            {'code': 'MN', 'common': 'Minnesota'},
            {'code': 'MS', 'common': 'Mississippi'},
            {'code': 'MO', 'common': 'Missouri'},
            {'code': 'PA', 'common': 'Pennsylvania'},
            {'code': 'RI', 'common': 'Rhode Island'},
            {'code': 'SC', 'common': 'South Carolina'},
            {'code': 'SD', 'common': 'South Dakota'},
            {'code': 'TN', 'common': 'Tennessee'},
            {'code': 'TX', 'common': 'Texas'},
            {'code': 'UT', 'common': 'Utah'},
            {'code': 'VT', 'common': 'Vermont'},
            {'code': 'VA', 'common': 'Virginia'},
            {'code': 'WA', 'common': 'Washington'},
            {'code': 'WV', 'common': 'West Virginia'},
            {'code': 'WI', 'common': 'Wisconsin'},
            {'code': 'WY', 'common': 'Wyoming'}
        ]};

    var region = function(code, common) {
        return {'code':code, 'common': common};
    };

    regionsService.list = function(country) {
        return countryRegions[country];
    };

    return regionsService;
});


