'use strict';

//
// This service return supported currencies
// Ref: http://en.wikipedia.org/wiki/ISO_4217
// Ref: http://www.xe.com/symbols.php
//
// Locations using the currency are stored in the locations array. This is encoded using ISO-3166
// Ref: Ref: http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
//
// Todos:
//  - add level of importance currency flag
//  - add continents
service.factory('Currencies', function($rootScope) {
    var currencyService = {};

    var currencyList = [
        {'code':'AED', 'symbol':'د.إ', 'currency':'United Arab Emirates dirham', 'decimals':'2', locations:['AE']},
        {'code':'AFN', 'symbol':'؋', 'currency':'Afghan Afghani', 'decimals':'2', locations:['AF']},
        {'code':'ALL', 'symbol':'Lek', 'currency':'Albania Lek', 'decimals':'2', locations:['AL']},
        {'code':'AMD', 'symbol':'֏', 'currency':'Armenian dram', 'decimals':'2', locations:['AM']},
        {'code':'ANG', 'symbol':'ƒ', 'currency':'Netherlands Antillean Guilder', 'decimals':'2', locations:['CW', 'SX']},
        {'code':'AOA', 'symbol':'Kz', 'currency':'Angolan kwanza', 'decimals':'2', locations:['AO']},
        {'code':'ARS', 'symbol':'$', 'currency':'Argentine Peso', 'decimals':'2', locations:['AR']},
        {'code':'AUD', 'symbol':'$', 'currency':'Australian Dollar', 'decimals':'2', locations:['AU', 'CX', 'CC', 'KI', 'NR', 'NF', 'TV']},
        {'code':'AWG', 'symbol':'Afl.', 'currency':'Aruban florin', 'decimals':'2', locations:['AW']},
        {'code':'AZN', 'symbol':'ман', 'currency':'Azerbaijani manat', 'decimals':'2', locations:['AZ']},
        {'code':'BAM', 'symbol':'KM', 'currency':'Bosnia and Herzegovina convertible mark', 'decimals':'2', locations:['BA']},
        {'code':'BBD', 'symbol':'$', 'currency':'Barbados dollar', 'decimals':'2', locations:['BB']},
        {'code':'BDT', 'symbol':'৳', 'currency':'Bangladeshi taka', 'decimals':'2', locations:['BD']},
        {'code':'BGN', 'symbol':'лв', 'currency':'Bulgaria lev', 'decimals':'2', locations:['BG']},
        {'code':'BHD', 'symbol':'.د.', 'currency':'Bahraini dinar', 'decimals':'3', locations:['BH']},
        {'code':'BIF', 'symbol':'FBu', 'currency':'Burundian franc', 'decimals':'0', locations:['BI']},
        {'code':'BMD', 'symbol':'$', 'currency':'Bermudian Dollar', 'decimals':'2', locations:['BM']},
        {'code':'BND', 'symbol':'$', 'currency':'Brunei dollar', 'decimals':'2', locations:['BN', 'SG']},
        {'code':'BOB', 'symbol':'$b', 'currency':'Boliviano', 'decimals':'2', locations:['BO']},
        {'code':'BRL', 'symbol':'R$', 'currency':'Brazilian Real', 'decimals':'2', locations:['BR']},
        {'code':'BSD', 'symbol':'$', 'currency':'Bahamian dollar', 'decimals':'2', locations:['BS']},
        {'code':'BTN', 'symbol':'Nu.', 'currency':'Bhutanese ngultrum', 'decimals':'2', locations:['BT']},
        {'code':'BWP', 'symbol':'P', 'currency':'Botswana pula', 'decimals':'2', locations:['BW']},
        {'code':'BYR', 'symbol':'Br', 'currency':'Belarusian ruble', 'decimals':'0', locations:['BY']},
        {'code':'BZD', 'symbol':'BZ$', 'currency':'Belize Dollar', 'decimals':'2', locations:['BZ']},
        {'code':'CAD', 'symbol':'$', 'currency':'Canadian dollar', 'decimals':'2', locations:['CA']},
        {'code':'CDF', 'symbol':'FC', 'currency':'Congolese franc', 'decimals':'2', locations:['CD']},
        {'code':'CHF', 'symbol':'CHF', 'currency':'Swiss franc', 'decimals':'2', locations:['CH', 'LI']},
        {'code':'CLP', 'symbol':'$', 'currency':'Chilean Peso', 'decimals':'0', locations:['CL']},
        {'code':'CNY', 'symbol':'¥', 'currency':'Chinese yuan', 'decimals':'2', locations:['CN']},
        {'code':'COP', 'symbol':'$', 'currency':'Colombian peso', 'decimals':'2', locations:['CO']},
        {'code':'CRC', 'symbol':'₡', 'currency':'Costa Rica colon', 'decimals':'2', locations:['CR']},
        {'code':'CUC', 'symbol':'$', 'currency':'Cuban convertible peso', 'decimals':'2', locations:['CU']},
        {'code':'CUP', 'symbol':'$', 'currency':'Cuban Peso', 'decimals':'2', locations:['CU']},
        {'code':'CVE', 'symbol':'$', 'currency':'Cape Verde escudo', 'decimals':'0', locations:['CV']},
        {'code':'CZK', 'symbol':'Kč', 'currency':'Czech koruna', 'decimals':'2', locations:['CZ']},
        {'code':'DJF', 'symbol':'Fdj', 'currency':'Djiboutian franc', 'decimals':'0', locations:['DJ']},
        {'code':'DKK', 'symbol':'kr', 'currency':'Danish krone', 'decimals':'2', locations:['DK', 'FO', 'GL']},
        {'code':'DOP', 'symbol':'$', 'currency':'Dominican peso', 'decimals':'2', locations:['DO']},
        {'code':'DZD', 'symbol':'دج', 'currency':'Algerian dinar', 'decimals':'2', locations:['DZ']},
        {'code':'EGP', 'symbol':'LE', 'currency':'Egyptian pound', 'decimals':'2', locations:['EG']},
        {'code':'ERN', 'symbol':'Nfk', 'currency':'Eritrean nakfa', 'decimals':'2', locations:['ER']},
        {'code':'ETB', 'symbol':'Br', 'currency':'Ethiopian birr', 'decimals':'2', locations:['ET']},
        {'code':'EUR', 'symbol':'€', 'currency':'Euro', 'decimals':'2', locations:['AD', 'AT', 'AX', 'BE', 'CY', 'EE', 'FI',
            'FR', 'DE', 'GR', 'IE', 'IT', 'XK', 'LU', 'MT', 'MC', 'ME', 'NL', 'PT', 'SM', 'SK', 'SI', 'ES', 'VA']},
        {'code':'FJD', 'symbol':'$', 'currency':'Fiji dollar', 'decimals':'2', locations:['FJ']},
        {'code':'FKP', 'symbol':'£', 'currency':'Falkland Islands pound', 'decimals':'2', locations:['FK']},
        {'code':'GBP', 'symbol':'£', 'currency':'Pound sterling', 'decimals':'2', locations:['GB', 'IM', 'GS', 'IO', 'PN']},
        {'code':'GEL', 'symbol':'ლ', 'currency':'Georgian lari', 'decimals':'2', locations:['GE']},
        {'code':'GHC', 'symbol':'GH₵', 'currency':'Ghanaian cedi', 'decimals':'2', locations:['GH']},
        {'code':'GIP', 'symbol':'£', 'currency':'Gibraltar Pound', 'decimals':'2', locations:['GI']},
        {'code':'GMD', 'symbol':'D', 'currency':'Gambian dalasi', 'decimals':'2', locations:['GM']},
        {'code':'GNF', 'symbol':'FG', 'currency':'Guinean franc', 'decimals':'0', locations:['GN']},
        {'code':'GTQ', 'symbol':'Q', 'currency':'Guatemalan quetzal', 'decimals':'2', locations:['GT']},
        {'code':'GYD', 'symbol':'$', 'currency':'Guyanese dollar', 'decimals':'2', locations:['GY']},
        {'code':'HKD', 'symbol':'$', 'currency':'Hong Kong dollar', 'decimals':'2', locations:['HK', 'MO']},
        {'code':'HNL', 'symbol':'L', 'currency':'Honduran lempira', 'decimals':'2', locations:['HN']},
        {'code':'HRK', 'symbol':'kn', 'currency':'Croatian kuna', 'decimals':'2', locations:['HR']},
        {'code':'HTG', 'symbol':'G', 'currency':'Haitian gourde', 'decimals':'2', locations:['HT']},
        {'code':'HUF', 'symbol':'Ft', 'currency':'Hungarian forint', 'decimals':'2', locations:['HU']},
        {'code':'IDR', 'symbol':'Rp', 'currency':'Indonesia Rupiah', 'decimals':'2', locations:['ID']},
        {'code':'ILS', 'symbol':'₪', 'currency':'Israeli new shekel', 'decimals':'2', locations:['IL']},
        {'code':'INR', 'symbol':'₹', 'currency':'Indian rupee', 'decimals':'2', locations:['IN']},
        {'code':'IQD', 'symbol':'ع.د', 'currency':'Iraqi dinar', 'decimals':'3', locations:['IQ']},
        {'code':'IRR', 'symbol':'﷼', 'currency':'Iranian rial', 'decimals':'0', locations:['IR']},
        {'code':'ISK', 'symbol':'kr', 'currency':'Icelandic króna', 'decimals':'0', locations:['IS']},
        {'code':'JMD', 'symbol':'$', 'currency':'Jamaican dollar', 'decimals':'2', locations:['JM']},
        {'code':'JOD', 'symbol':'JD', 'currency':'Jordanian dinar', 'decimals':'3', locations:['JO']},
        {'code':'JPY', 'symbol':'¥', 'currency':'Japanese yen', 'decimals':'0', locations:['JP']},
        {'code':'KES', 'symbol':'KSh', 'currency':'Kenyan shilling', 'decimals':'2', locations:['KE']},
        {'code':'KGS', 'symbol':'лв', 'currency':'Kyrgyzstani som', 'decimals':'2', locations:['KG']},
        {'code':'KHR', 'symbol':'៛', 'currency':'Cambodian riel', 'decimals':'2', locations:['KH']},
        {'code':'KMF', 'symbol':'CF', 'currency':'Comoro franc', 'decimals':'0', locations:['KM']},
        {'code':'KPW', 'symbol':'₩', 'currency':'North Korean won', 'decimals':'0', locations:['KP']},
        {'code':'KRW', 'symbol':'₩', 'currency':'South Korean won', 'decimals':'0', locations:['KR']},
        {'code':'KWD', 'symbol':'د.ك', 'currency':'Kuwaiti dinar', 'decimals':'3', locations:['KW']},
        {'code':'KYD', 'symbol':'$', 'currency':'Cayman Islands dollar', 'decimals':'2', locations:['KY']},
        {'code':'KZT', 'symbol':'₸', 'currency':'Kazakhstani tenge', 'decimals':'2', locations:['KZ']},
        {'code':'LAK', 'symbol':'₭', 'currency':'Lao kip', 'decimals':'0', locations:['LA']},
        {'code':'LBP', 'symbol':'ل.ل', 'currency':'Lebanese pound', 'decimals':'0', locations:['LB']},
        {'code':'LKR', 'symbol':'රු', 'currency':'Sri Lankan rupee', 'decimals':'2', locations:['LK']},
        {'code':'LRD', 'symbol':'L$', 'currency':'Liberian dollar', 'decimals':'2', locations:['LR']},
        {'code':'LSL', 'symbol':'L', 'currency':'Lesotho loti', 'decimals':'2', locations:['LS']},
        {'code':'LTL', 'symbol':'Lt', 'currency':'Lithuanian litas', 'decimals':'2', locations:['LT']},
        {'code':'LVL', 'symbol':'Ls', 'currency':'Latvian lats', 'decimals':'2', locations:['LV']},
        {'code':'LYD', 'symbol':'LD', 'currency':'Libyan dinar', 'decimals':'3', locations:['LY']},
        {'code':'MAD', 'symbol':'د.م.', 'currency':'Moroccan dirham', 'decimals':'2', locations:['MA']},
        {'code':'MDL', 'symbol':'', 'currency':'Moldovan leu', 'decimals':'2', locations:['MD']},
        {'code':'MGA', 'symbol':'Ar', 'currency':'Malagasy ariary', 'decimals':'2', locations:['MG']},
        {'code':'MKD', 'symbol':'ден', 'currency':'Macedonian denar', 'decimals':'0', locations:['MK']},
        {'code':'MMK', 'symbol':'K', 'currency':'Myanma kyat', 'decimals':'0', locations:['MM']},
        {'code':'MNT', 'symbol':'₮', 'currency':'Mongolian tugrik', 'decimals':'', locations:['MN']},
        {'code':'MOP', 'symbol':'MOP$', 'currency':'Macanese pataca', 'decimals':'2', locations:['MO']},
        {'code':'MRO', 'symbol':'UM', 'currency':'Mauritanian ouguiya', 'decimals':'3', locations:['MR']},
        {'code':'MUR', 'symbol':'₨', 'currency':'Mauritian rupee', 'decimals':'2', locations:['MU']},
        {'code':'MVR', 'symbol':'Rf', 'currency':'Maldivian rufiyaa', 'decimals':'2', locations:['MV']},
        {'code':'MWK', 'symbol':'MK', 'currency':'Malawian kwacha', 'decimals':'2', locations:['MW']},
        {'code':'MXN', 'symbol':'$', 'currency':'Mexican peso', 'decimals':'2', locations:['MX']},
        {'code':'MYR', 'symbol':'RM', 'currency':'Malaysian ringgit', 'decimals':'2', locations:['MY']},
        {'code':'MZN', 'symbol':'MT', 'currency':'Mozambican metical', 'decimals':'2', locations:['MZ']},
        {'code':'NAD', 'symbol':'N$', 'currency':'Namibian dollar', 'decimals':'2', locations:['NA']},
        {'code':'NGN', 'symbol':'₦', 'currency':'Nigerian naira', 'decimals':'2', locations:['NG']},
        {'code':'NIO', 'symbol':'C$', 'currency':'Nicaraguan córdoba', 'decimals':'2', locations:['NI']},
        {'code':'NOK', 'symbol':'kr', 'currency':'Norwegian krone', 'decimals':'2', locations:['NO', 'SJ', 'BV']},
        {'code':'NPR', 'symbol':'₨', 'currency':'Nepalese rupee', 'decimals':'2', locations:['NP']},
        {'code':'NZD', 'symbol':'$', 'currency':'New Zealand dollar', 'decimals':'2', locations:['NZ', 'NU', 'TK', 'CK']},
        {'code':'OMR', 'symbol':'ر.ع.', 'currency':'Omani rial', 'decimals':'3', locations:['OM']},
        {'code':'PAB', 'symbol':'B/.', 'currency':'Panamanian balboa', 'decimals':'2', locations:['PA']},
        {'code':'PEN', 'symbol':'S/.', 'currency':'Peruvian nuevo sol', 'decimals':'2', locations:['PE']},
        {'code':'PGK', 'symbol':'K', 'currency':'Papua New Guinean kina', 'decimals':'2', locations:['PG']},
        {'code':'PHP', 'symbol':'₱', 'currency':'Philippine peso', 'decimals':'2', locations:['PH']},
        {'code':'PKR', 'symbol':'₨', 'currency':'Pakistani rupee', 'decimals':'2', locations:['PK']},
        {'code':'PLN', 'symbol':'zł', 'currency':'Polish złoty', 'decimals':'2', locations:['PL']},
        {'code':'PYG', 'symbol':'₲', 'currency':'Paraguayan guaraní', 'decimals':'0', locations:['PY']},
        {'code':'QAR', 'symbol':'﷼', 'currency':'Qatari riyal', 'decimals':'2', locations:['QA']},
        {'code':'RON', 'symbol':'lei', 'currency':'Romanian new leu', 'decimals':'2', locations:['RO']},
        {'code':'RSD', 'symbol':'RSD', 'currency':'Serbian dinar', 'decimals':'2', locations:['RS']},
        {'code':'RUB', 'symbol':'руб', 'currency':'Russian rouble', 'decimals':'2', locations:['RU']},
        {'code':'RWF', 'symbol':'FRw', 'currency':'Rwandan franc', 'decimals':'0', locations:['RW']},
        {'code':'SAR', 'symbol':'﷼', 'currency':'Saudi riyal', 'decimals':'2', locations:['SA']},
        {'code':'SBD', 'symbol':'SI$', 'currency':'Solomon Islands dollar', 'decimals':'2', locations:['SB']},
        {'code':'SCR', 'symbol':'SR', 'currency':'Seychelles rupee', 'decimals':'2', locations:['SC']},
        {'code':'SDG', 'symbol':'', 'currency':'Sudanese pound', 'decimals':'2', locations:['SD']},
        {'code':'SEK', 'symbol':'kr', 'currency':'Swedish krona/kronor', 'decimals':'2', locations:['SE']},
        {'code':'SGD', 'symbol':'S$', 'currency':'Singapore dollar', 'decimals':'2', locations:['SG']},
        {'code':'SHP', 'symbol':'£', 'currency':'Saint Helena pound', 'decimals':'2', locations:['SH']},
        {'code':'SLL', 'symbol':'Le', 'currency':'Sierra Leonean leone', 'decimals':'0', locations:['SL']},
        {'code':'SOS', 'symbol':'S', 'currency':'Somalia Shilling', 'decimals':'2', locations:['SO']},
        {'code':'SRD', 'symbol':'$', 'currency':'Surinamese dollar', 'decimals':'2', locations:['SR']},
        {'code':'SSP', 'symbol':'', 'currency':'South Sudanese pound', 'decimals':'2', locations:['SS']},
        {'code':'STD', 'symbol':'Db', 'currency':'São Tomé and Príncipe dobra', 'decimals':'0', locations:['ST']},
        {'code':'SYP', 'symbol':'LS', 'currency':'Syrian pound', 'decimals':'2', locations:['SY']},
        {'code':'SZL', 'symbol':'L', 'currency':'Swazi lilangeni', 'decimals':'2', locations:['SZ']},
        {'code':'THB', 'symbol':'฿', 'currency':'Thailand Baht', 'decimals':'2', locations:['TH']},
        {'code':'TJS', 'symbol':'', 'currency':'Tajikistani somoni', 'decimals':'2', locations:['TJ']},
        {'code':'TMT', 'symbol':'m', 'currency':'Turkmenistani manat', 'decimals':'2', locations:['TM']},
        {'code':'TND', 'symbol':'د.ت', 'currency':'Tunisian dinar', 'decimals':'3', locations:['TN']},
        {'code':'TOP', 'symbol':'T$', 'currency':'Tongan paʻanga', 'decimals':'2', locations:['TO']},
        {'code':'TRY', 'symbol':'₺', 'currency':'Turkish lira', 'decimals':'2', locations:['TR']},
        {'code':'TTD', 'symbol':'$', 'currency':'Trinidad and Tobago dollar', 'decimals':'2', locations:['TT']},
        {'code':'TWD', 'symbol':'$', 'currency':'New Taiwan dollar', 'decimals':'2', locations:['TW']},
        {'code':'TZS', 'symbol':'x/y', 'currency':'Tanzanian shilling', 'decimals':'2', locations:['TZ']},
        {'code':'UAH', 'symbol':'₴', 'currency':'Ukrainian hryvnia', 'decimals':'2', locations:['UA']},
        {'code':'UGX', 'symbol':'USh', 'currency':'Ugandan shilling', 'decimals':'2', locations:['UG']},
        {'code':'USD', 'symbol':'$', 'currency':'United States dollar', 'decimals':'2', locations:['US', 'AS', 'IO',
            'VG', 'BQ', 'EC', 'SV', 'GU', 'MH', 'FM', 'MP', 'PW', 'PA', 'PR', 'TP', 'TC', 'VI', 'ZW']},
        {'code':'UYU', 'symbol':'$U', 'currency':'Uruguayan peso', 'decimals':'2', locations:['UY']},
        {'code':'UZS', 'symbol':'лв', 'currency':'Uzbekistan som', 'decimals':'2', locations:['UZ']},
        {'code':'VEF', 'symbol':'Bs.', 'currency':'Venezuelan bolívar fuerte', 'decimals':'2', locations:['VE']},
        {'code':'VND', 'symbol':'₫', 'currency':'Vietnamese dong', 'decimals':'0', locations:['VN']},
        {'code':'VUV', 'symbol':'VT', 'currency':'Vanuatu vatu', 'decimals':'0', locations:['VU']},
        {'code':'WST', 'symbol':'WS$', 'currency':'Samoan tala', 'decimals':'2', locations:['WS']},
        {'code':'XAF', 'symbol':'FCFA', 'currency':'CFA franc BEAC', 'decimals':'0', locations:['CM', 'CG', 'TD', 'GQ', 'GA']},
        {'code':'XCD', 'symbol':'', 'currency':'East Caribbean dollar', 'decimals':'2', locations:['AI', 'AG', 'DM',
            'GD', 'MS', 'KN', 'WL', 'VC']},
        {'code':'XOF', 'symbol':'CFA', 'currency':'CFA franc BCEAO', 'decimals':'0', locations:['BJ', 'BF', 'CI', 'GW',
            'ML', 'NE', 'SN', 'TG']},
        {'code':'XPF', 'symbol':'F', 'currency':'CFP franc', 'decimals':'0', locations:['PF', 'NC', 'WF']},
        {'code':'YER', 'symbol':'', 'currency':'Yemeni rial', 'decimals':'2', locations:['YE']},
        {'code':'ZAR', 'symbol':'', 'currency':'South African rand', 'decimals':'2', locations:['ZA']},
        {'code':'ZMW', 'symbol':'', 'currency':'Zambian kwacha', 'decimals':'2', locations:['ZM']}
    ];

    var currencyList2 = [
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

    currencyList2.forEach(function(currencyItem) {
        currencyItem.codeCurrency = currencyItem.code + ' - ' + currencyItem.currency;
    });



    currencyService.list = function(callbackFunction) {
        if(angular.isDefined(callbackFunction)) {
            callbackFunction(currencyList2);
        }

        return currencyList2;
    };

    return currencyService;
});

