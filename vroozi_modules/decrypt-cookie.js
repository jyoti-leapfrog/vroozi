var crypto = require("crypto");

function encrypt(text) {
    var cipher = crypto.createCipher('aes-128-cbc','InmbuvP6Z8Inmbuv');
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(crypted) {
    var decipher = crypto.createDecipher('aes-128-ecb','InmbuvP6Z8Inmbuv');
    var dec = decipher.update(crypted,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

function decryptHA(crypted) {
    // var decipher = crypto.createDecipheriv("aes-128-ecb", new Buffer("01020304050607080910111213141516", "hex").toString("binary"), "");
    var decipher = crypto.createDecipheriv("aes-256-ecb", new Buffer("0102030405060708091011121314151601020304050607080910111213141516", "hex").toString("binary"), "");
    var dec = decipher.update(crypted,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

function decryptEcb(crypted) {
    var iv = createBinaryString('0a7059447a0d5c7e82059ece732647033b12d34f79a49795620bc87b20d2da77');
    console.log(iv.length);
    var decipher = crypto.createDecipheriv('aes-128-ecb','InmbuvP6Z8Inmbuv', iv);
    var dec = decipher.update(crypted,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

function createBinaryString(input) {
    var crypto = require("crypto");
    var hash = crypto.createHash("md5");
    hash.update(input);
    return hash.digest();
}

var dec = decrypt('8b32e36fd9cb6f0c7eb5da83a25cb9c1c6de93196254a1a0608dcf856e2e71a07f6634f7bc065e922b6d8b9f8f1c4c6b20e3a3d3b3eb258dcf419d4efe00125498a21381f650ce764cae65e728e36163279135baa83d363e85829a46977d692a06c3d15444c690da4dee316313ecca52be51cb89d98350b82bdd2ad746e91274c0ed70c516488b6126cb2b1e7ac9baf161313b18f6a9d4dc47cb615f94664d8b66d711eba43b8c6aff01821c9e9897d2b7bd43c08c6aaf0fdd08078935bb8eea47a80bb223aa1383dbf3ac09a977942cb29f7f5994ea764997147fa9250acb35455eccb75b54a5c40ce59a92db6f5d6b21d4d54529b99feb1d8932055eab68c43643335b94607782723131dcbd2cd5d2');
//var dec = decryptEcb('1c97e386633121826e07cdbe8a0b3bb5'); 

console.log('decrypted string equals: ' + dec);



