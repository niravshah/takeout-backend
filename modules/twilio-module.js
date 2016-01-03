var exports = module.exports = {};
var twilio = require('twilio')('AC83e7e43fe1b509ba02108e6b35256f63', 'f648ed4e8609d9d594355e75cd981f4c');
var Chance = require('chance');
var chance = new Chance();
var twilio_number = '441202835085';
var redis = require("redis");
var rediscli = redis.createClient();
var User = require('./../models/user');

exports.sendVerificationCode = function(userid, toNumber, rC) {
    var code = chance.natural({
        min: 1000,
        max: 9999
    });
    twilio.sendMessage({
        to: toNumber,
        from: twilio_number,
        body: code
    }, function(err, responseData) {
        if(!err) {
            var key = 'twilio:' + userid
            rediscli.set(key, code, function(err) {
                if(err) {
                    console.log('Errr!');
                }
            });
            var key = 'pnumber:' + userid
            rediscli.set(key, toNumber);
            console.log(responseData)
            rC(responseData)
        } else {
            console.log('Error', err)
            rC(err)
        }
    });
}
exports.verifyCode = function(userid, code, rC) {
    var key = 'twilio:' + userid
    var key2 = 'pnumber:' + userid
    rediscli.get(key, function(err, result) {
        if(code == result) {
            User.findAsync({
                accountId: userid
            }).then(function(users) {
                if(users.length) {
                    rediscli.get(key2, function(err, result) {
                        console.log('verifyCode: User Found');
                        users[0].phone_verified = true;
                        users[0].phone = result;
                        users[0].saveAsync().then(function(res) {
                            console.log('User Verified!', res);
                            rediscli.del(key, function(err, results) {
                                console.log('Code Verified!');
                                rC(null,{msg:'Code Verified!'});
                            });
                            rediscli.del(key2);
                        }).
                        catch(function(err) {
                            console.log('User Save Error', err)
                            rC(new Error('Code Verification Error!'),null)
                        });
                    })
                } else {
                    console.log('User Not Found', users);
                    rC(new Error('Code Verification Error!'),null);
                }
            });
        } else {
            console.log('Result Not Found', result)
            rC(new Error('Code Verification Error!'), null);
        }
    });
}