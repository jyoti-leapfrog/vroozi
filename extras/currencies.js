/**
 * Created with JetBrains WebStorm.
 * User: msundell
 * Date: 5/16/13
 * Time: 11:31 PM
 * To change this template use File | Settings | File Templates.
 */

var currencyList = [
    {'code':'AUD', 'symbol':'$', 'currency':'Australian Dollar', 'decimals':'2', locations:['AU', 'CX', 'CC', 'KI', 'NR', 'NF', 'TV']},
    {'code':'CAD', 'symbol':'$', 'currency':'Canadian dollar', 'decimals':'2', locations:['CA']},
    {'code':'CNY', 'symbol':'¥', 'currency':'Chinese yuan', 'decimals':'2', locations:['CN']},
    {'code':'EUR', 'symbol':'€', 'currency':'Euro', 'decimals':'2', locations:['AD', 'AT', 'AX', 'BE', 'CY', 'EE', 'FI',
        'FR', 'DE', 'GR', 'IE', 'IT', 'XK', 'LU', 'MT', 'MC', 'ME', 'NL', 'PT', 'SM', 'SK', 'SI', 'ES', 'VA']},
    {'code':'GBP', 'symbol':'£', 'currency':'Pound sterling', 'decimals':'2', locations:['GB', 'IM', 'GS', 'IO', 'PN']},
    {'code':'INR', 'symbol':'₹', 'currency':'Indian rupee', 'decimals':'2', locations:['IN']},
    {'code':'PKR', 'symbol':'₨', 'currency':'Pakistani rupee', 'decimals':'2', locations:['PK']},
    {'code':'THB', 'symbol':'฿', 'currency':'Thailand Baht', 'decimals':'2', locations:['TH']},
    {'code':'USD', 'symbol':'$', 'currency':'United States dollar', 'decimals':'2', locations:['US', 'AS', 'IO',
        'VG', 'BQ', 'EC', 'SV', 'GU', 'MH', 'FM', 'MP', 'PW', 'PA', 'PR', 'TP', 'TC', 'VI', 'ZW']}
];

exports.currencyCode = function(code){
    for(var i=0; currencyList.length; i++) {
        if(code.toUpperCase() === currencyList[i].code.toUpperCase()) {
            return currencyList[i].symbol;
        }
    }
    return "(" + code + ") ";
};
