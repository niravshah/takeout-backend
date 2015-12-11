var exports = module.exports = {};
var twilio = require('twilio')('AC83e7e43fe1b509ba02108e6b35256f63', 'f648ed4e8609d9d594355e75cd981f4c');
var Chance = require('chance');
var chance = new Chance();
var twilio_number = '441202835085';
var redis = require("redis");
var rediscli = redis.createClient();

exports.sendVerificationCode = function(userid, toNumber, rC) {    
    var code = chance.natural({min: 1000, max: 9999});     
    twilio.sendMessage({
        to:toNumber,
        from: twilio_number,
        body: code
    }, function(err, responseData) {
        if (!err) {
            console.log('Error:', responseData.from);
            console.log('Error:', responseData.body);
            var key = 'twilio:' + userid
            rediscli.set(key, code,function(err){                
                if(err){
                    console.log('Errr!');
                }
            });            
            rC(responseData)    
        }else{           
            rC(err)
        }        
        
    });
}

