var exports = module.exports = {};
var superagent = require('superagent');
var apiKey = 'rX9oOJj4R0aBwIMRWnUiEw2522'
var apiUrl = 'https://api.getAddress.io/v2/uk/'

var stub = '{"Latitude":51.596866899999988,"Longitude":-0.2539208,"Addresses":["Flat 12, PlamerCourt, 34 Charcot Road, , , London, Greater London","Flat 14, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 15, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 17, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 18, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 2, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 20, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 21, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 22, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 23, Plamer Court,34 Charcot Road, , , London, Greater London","Flat 24, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 25, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 26, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 27, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 28, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 29, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 3, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 31, Plamer Court, 34 Charcot Road,, , London, Greater London","Flat 32, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 33, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 34, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 35, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 36, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 37, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 38, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 39, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 40, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 41, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 42, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 43, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 44, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 45, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 46, Plamer Court, 34 Charcot Road, , , London, Greater London","Flat 47, Plamer Court, 34 Charcot Road, , , London, Greater London"]}'


exports.getAddresses = function(postcode, rC) {
    rC(stub)
    /*var url = apiUrl + postcode;
    superagent.get(url).query({
        'api-key': apiKey
    }).end(function(err, resp) {
        if(err) {
            rC(err)
        } else {
            console.log(resp.text);
            rC(resp.text)
        }
    });*/
}