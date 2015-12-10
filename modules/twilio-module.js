var exports = module.exports = {};
var twilio = require('twilio')('AC83e7e43fe1b509ba02108e6b35256f63', 'f648ed4e8609d9d594355e75cd981f4c');


exports.sendVerificationCode = function(toNumber, fromNumber, code, rC) {
//Send an SMS text message
twilio.sendMessage({
    to:toNumber,
    from: fromNumber', // A number you bought from Twilio and can use for outbound communication
    body: code

}, function(err, responseData) { //this function is executed when a response is received from Twilio
    if (!err) { // "err" is an error received during the request, if any
        // "responseData" is a JavaScript object containing data received from Twilio.
        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
        // http://www.twilio.com/docs/api/rest/sending-sms#example-1
        console.log(responseData.from); // outputs "+14506667788"
        console.log(responseData.body); // outputs "word to your mother."

    }
});


}