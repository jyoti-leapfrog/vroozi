'use strict';

service.factory('Categories', function($rootScope) {
    var categoryService = {};

    var categoriesList = [
//    { unspscCode: '43210000', unspscCategory: 'Computer Equipment'},
//    { unspscCode: '44120000',unspscCategory: 'Office Supplies' },
//    { unspscCode: '80000000',unspscCategory: 'Management and Professional Services' },
    { unspscCode: '12000000', unspscCategory: 'Chemicals'},
    { unspscCode: '13000000',  unspscCategory:'Resin'},
    { unspscCode: '14000000',unspscCategory:'Paper Materials and Products'},
    { unspscCode: '15000000', unspscCategory:'Fuels and Lubricants'} ,
    { unspscCode: '22000000',unspscCategory: 'Construction Machinery'},
    { unspscCode: '23000000',
        unspscCategory: 'Industrial Manufacturing  Machinery'},
    { unspscCode: '23100000',
        unspscCategory: 'Raw materials machinery'},
    { unspscCode: '23110000',
        unspscCategory: 'Petroleum machinery'},
    { unspscCode: '23120000',
        unspscCategory: 'Textile and fabric machinery'},
    { unspscCode: '23130000',
        unspscCategory: 'Lapidary machinery'},
    { unspscCode: '23150000',
        unspscCategory: 'Industrial process machinery'},
    { unspscCode: '23160000',
        unspscCategory: 'Foundry machines'},
    { unspscCode: '23180000',
        unspscCategory: 'Food and beverage equipment'},
    { unspscCode: '23190000',
        unspscCategory: 'Mixers and parts'},
    { unspscCode: '23200000',
        unspscCategory: 'Mass transfer equipment'},
    { unspscCode: '23210000',
        unspscCategory: 'Electronic manufacturing machinery'},
    { unspscCode: '23230000',
        unspscCategory: 'Sawmilling Machinery'},
    { unspscCode: '23240000',
        unspscCategory: 'Metal cutting machinery'},
    { unspscCode: '23250000',
        unspscCategory: 'Metal forming machinery'},
    { unspscCode: '23260000',
        unspscCategory: 'Rapid prototyping machinery'},
    { unspscCode: '23270000',
        unspscCategory: 'Welding machinery'},
    { unspscCode: '23280000',
        unspscCategory: 'Metal treatment machinery'},
    { unspscCode: '23290000',
        unspscCategory: 'Industrial machine tools'},
    { unspscCode: '24000000',
        unspscCategory: 'Storage Machinery'},
    { unspscCode: '25000000',
        unspscCategory: 'Vehicles'},
    { unspscCode: '26000000',
        unspscCategory: 'Power Generation'},
    { unspscCode: '27000000',
        unspscCategory: 'Tools and General Machinery'},
    { unspscCode: '27110000',
        unspscCategory: 'Hand tools'},
    { unspscCode: '27120000',
        unspscCategory: 'Hydraulic machinery'},
    { unspscCode: '27130000',
        unspscCategory: 'Pneumatic machinery'},
    { unspscCode: '27140000',
        unspscCategory: 'Automotive specialty tools'},
    { unspscCode: '30000000',
        unspscCategory: 'Structure Maintenance'},
    { unspscCode: '31000000',
        unspscCategory: 'Manufacturing Components'},
    { unspscCode: '32000000',
        unspscCategory: 'Electronic Components'},
    { unspscCode: '39000000',
        unspscCategory: 'Electrical Systems'},
    { unspscCode: '40000000',
        unspscCategory: 'Conditioning Systems'},
    { unspscCode: '40100000',
        unspscCategory: 'HVAC'},
    { unspscCode: '40140000',
        unspscCategory: 'Fluid and gas distribution'},
    { unspscCode: '40150000',
        unspscCategory: 'Industrial pumps'},
    { unspscCode: '40160000',
        unspscCategory: 'Industrial filtering'},
    { unspscCode: '40170000',
        unspscCategory: 'Pipe and fittings'},
    { unspscCode: '40180000',
        unspscCategory: 'Tubing and fittings'},
    { unspscCode: '41000000',
        unspscCategory: 'Laboratory Equipment'},
    { unspscCode: '41100000',
        unspscCategory: 'Lab and scientific equipment'},
    { unspscCode: '41110000',
        unspscCategory: 'Measuring and testing instruments'},
    { unspscCode: '41120000',
        unspscCategory: 'Laboratory supplies and fixtures'},
    { unspscCode: '42000000',
        unspscCategory: 'Medical Equipment'},
    { unspscCode: '43000000',
        unspscCategory: 'Information Technology'},
    { unspscCode: '43190000',
        unspscCategory: 'Communications Devices'},
    { unspscCode: '43200000',
        unspscCategory: 'Computer Components'},
    { unspscCode: '43210000',
        unspscCategory: 'Computer Equipment'},
    { unspscCode: '43211500',
        unspscCategory: 'Computers and Servers'},
    { unspscCode: '43211600',
        unspscCategory: 'Computer accessories'},
    { unspscCode: '43211700',
        unspscCategory: 'Computer data input devices'},
    { unspscCode: '43211800',
        unspscCategory: 'Computer data input device accessories'},
    { unspscCode: '43211900',
        unspscCategory: 'Computer monitors'},
    { unspscCode: '43212000',
        unspscCategory: 'Computer display accessories'},
    { unspscCode: '43212100',
        unspscCategory: 'Computer printers'},
    { unspscCode: '43220000',
        unspscCategory: 'Data Voice and Ntwk Equipment'},
    { unspscCode: '43230000',
        unspscCategory: 'Software'},
    { unspscCode: '44000000',
        unspscCategory: 'Office Equipment'},
    { unspscCode: '44100000',
        unspscCategory: 'Office machines'},
    { unspscCode: '44110000',
        unspscCategory: 'Office and desk accessories'},
    { unspscCode: '44120000',
        unspscCategory: 'Office supplies'},
    { unspscCode: '45000000',
        unspscCategory: 'Print Services and Supplies'},
    { unspscCode: '46000000',
        unspscCategory: 'Security Equipment'},
    { unspscCode: '47000000',
        unspscCategory: 'Cleaning Equipment and Supplies'},
    { unspscCode: '50000000',
        unspscCategory: 'Food and Beverage'},
    { unspscCode: '52000000',
        unspscCategory: 'Consumer Electronics'},
    { unspscCode: '53000000',
        unspscCategory: 'Apparel'},
    { unspscCode: '55000000',
        unspscCategory: 'Published Products'},
    { unspscCode: '55100000',
        unspscCategory: 'Printed media'},
    { unspscCode: '55110000',
        unspscCategory: 'Electronic media'},
    { unspscCode: '55120000',
        unspscCategory: 'Signage and accessories'},
    { unspscCode: '56000000',
        unspscCategory: 'Furniture and Furnishings'},
    { unspscCode: '56100000',
        unspscCategory: 'Accommodation furniture'},
    { unspscCode: '56110000',
        unspscCategory: 'Commercial and industrial furniture'},
    { unspscCode: '56120000',
        unspscCategory: 'Classroom fixtures'},
    { unspscCode: '56130000',
        unspscCategory: 'Merchandising furniture'},
    { unspscCode: '71000000',
        unspscCategory: 'Mining Machinery'},
    { unspscCode: '72000000',
        unspscCategory: 'Construction Services'},
    { unspscCode: '73000000',
        unspscCategory: 'Industrial Production'},
    { unspscCode: '76000000',
        unspscCategory: 'Industrial Cleaning Services'},
    { unspscCode: '77000000',
        unspscCategory: 'Environmental Services'},
    { unspscCode: '78000000',
        unspscCategory: 'Transportation Services'},
    { unspscCode: '80000000',
        unspscCategory: 'Management Services'},
    { unspscCode: '80100000',
        unspscCategory: 'Management advisory services'},
    { unspscCode: '80110000',
        unspscCategory: 'Human resources services'},
    { unspscCode: '80120000',
        unspscCategory: 'Legal services'},
    { unspscCode: '80130000',
        unspscCategory: 'Real estate services'},
    { unspscCode: '80140000',
        unspscCategory: 'Marketing and distribution'},
    { unspscCode: '80150000',
        unspscCategory: 'Trade policy and services'},
    { unspscCode: '80160000',
        unspscCategory: 'Business administration services'},
    { unspscCode: '81000000',
        unspscCategory: 'Technology Services'},
    { unspscCode: '81100000',
        unspscCategory: 'Professional engineering services'},
    { unspscCode: '81110000',
        unspscCategory: 'Computer services'},
    { unspscCode: '81120000',
        unspscCategory: 'Economics'},
    { unspscCode: '81130000',
        unspscCategory: 'Statistics'},
    { unspscCode: '81140000',
        unspscCategory: 'Manufacturing technologies'},
    { unspscCode: '81150000',
        unspscCategory: 'Earth science services'},
    { unspscCode: '81160000',
        unspscCategory: 'Information Technology Service Delivery'},
    { unspscCode: '82000000',
        unspscCategory: 'Graphics and Art Services'},
    { unspscCode: '83000000',
        unspscCategory: 'Public Sector Services'},
    { unspscCode: '84000000',
        unspscCategory: 'Financial Services'},
    { unspscCode: '85000000',
        unspscCategory: 'Healthcare Services'},
    { unspscCode: '86000000',
        unspscCategory: 'Education and Training Services'},
    { unspscCode: '90000000',
        unspscCategory: 'Travel Services'},
    { unspscCode: '91000000',
        unspscCategory: 'Personal Services'},
    { unspscCode: '92000000',
        unspscCategory: 'Security Services'},
    { unspscCode: '93000000',
        unspscCategory: 'Politics and Civic Affairs Services'},
    { unspscCode: '95000000',
        unspscCategory: 'Lands and Buildings'}
];

    categoryService.list = function(callbackFunction) {
        if(angular.isDefined(callbackFunction)) {
            callbackFunction(categoriesList);
        }

        return categoriesList;
    };

    return categoryService;
});
