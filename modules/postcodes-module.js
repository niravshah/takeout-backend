var exports = module.exports = {};
var superagent = require('superagent');
var apiKey = 'rX9oOJj4R0aBwIMRWnUiEw2522'
var apiUrl = 'https://api.getAddress.io/v2/uk/'

exports.getAddresses = function(postcode, rC) {
    var url = apiUrl + postcode;
    superagent.get(url).query({
        'api-key': apiKey
    }).end(function(err, resp) {
        if(err) {
            rC(err)
        } else {
            rC(resp.text)
        }
    });
}