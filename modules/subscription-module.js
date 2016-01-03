var exports = module.exports = {};
var google_client_id = "1054636785796-j4ekc1r25nlmq0ut4fgehdqbi3i1o1on.apps.googleusercontent.com"
var google_client_id_ninja = "456137028163-js02529oilihsdcn1sq5ovtdjmp6rbpn.apps.googleusercontent.com"
var superagent = require('superagent');
var User = require('./../models/user');
//var mongoose = require('mongoose');
var mongoose = require('mongoose-bird')();
mongoose.connect('mongodb://localhost/gdn');
var redis = require("redis");
var rediscli = redis.createClient();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('./../config');
exports.gdnTest = function(id) {
    return gdn.get(id);
}
exports.validateTokenFromGoogle = function(src, token, userProps, errCallback, resCallback) {
    superagent.get("https://www.googleapis.com/oauth2/v3/tokeninfo").query({
        id_token: token
    }).end(function(err, resp) {
        if(err) {
            console.log('Google Token Info Error:', err)
            errCallback(err)
        }
        if(src == 'ninja') client_id = google_client_id_ninja;
        else client_id = google_client_id
        if(resp.body.aud == client_id) {
            console.log('Google Token Info Aud matches', resp.body.sub)
            User.findAsync({
                accountId: resp.body.sub
            }).then(function(user) {
                if(user.length) {
                    console.log('Existing User:', user[0].accountId);
                    var token = jwt.sign(user, config.secret, {
                        expiresIn: 86400
                    });
                    var us = {}
                    us.user = user[0]
                    us.token = token
                    resCallback(us)
                } else {
                    var newUser = User({
                        personName: userProps.personName,
                        personEmail: userProps.personEmail,
                        accountId: userProps.accountId,
                        personPhoto: userProps.personPhoto,
                        active: false,
                        valid_till_m: null,
                        valid_till_y: null,
                        connected: false,
                        new: true,
                        payment_verified: false,
                        phone_verified: false,
                        gcm: '',
                        rgcm: '',
                        password: '',
                        defaultService: 's1',
                        defaultServiceName: 'Takeaway Delivery',
                        stripe_connected:false,
                        stripe_active:false,
                        stripe_account:'',
                        phone:''
                    });
                    console.log('Saving New User')
                    newUser.saveAsync().then(function(newUsr) {
                        updateGCMFromRedis(userProps.accountId);
                        updateRGCMFromRedis(userProps.accountId);
                        var token = jwt.sign(user, config.secret, {
                            expiresIn: 86400
                        });
                        var us = {}
                        us.user = newUsr[0]
                        us.token = token
                        resCallback(us)
                    }).
                    catch(function(err) {
                        if(err) throw err
                    });
                }
            }).
            catch(function(err) {
                console.log('User Find Error!', err);
            });
        }
    });
}
exports.registerUserGCMToken = function(token, aId, personEmail, ninja) {
    User.find({
        accountId: aId
    }, function(err, users) {
        if(users.length) {
            console.log('GCM Token', token, aId)
            if(ninja == true) {
                users[0].gcm = '"' + token + '"';
            } else {
                users[0].rgcm = '"' + token + '"';
            }
            //console.log(users[0])
            users[0].save(function(err) {
                if(err) throw err;
                console.log('GCM ID Updated! - ', aId)
            });
        } else {
            console.log('GCM - No Corresponding User Found -', aId)
        }
        if(ninja == true) {
            var key = "gcm:" + aId
            rediscli.set(key, token);
        } else {
            var key = "rgcm:" + aId
            rediscli.set(key, token);
        }
    })
}
var updateGCMFromRedis = function(aId) {
    var key = "gcm:" + aId
    rediscli.get(key, function(err, result) {
        if(err) {
            throw err
        } else {
            console.log('GCM update: Token Found', result);
            console.log('GCM update: Account Id', aId);
            User.findAsync({
                accountId: aId
            }).then(function(users) {
                if(users.length) {
                    console.log('GCM update: User Found');
                    users[0].gcm = '"' + result + '"';
                    console.log('Saving User', users[0].accountId)
                    users[0].saveAsync().then(function(res) {
                       // console.log('GCM ID Updated!', res)
                    }).
                    catch(function(err) {
                        console.log('User Save Error', err)
                    });
                } else {
                    console.log('GCM update User Not Found', users)
                }
            }).
            catch(function(err) {
                console.log('GCM update User Find Error', err)
            })
        }
    });
}
var updateRGCMFromRedis = function(aId) {
    var key = "rgcm:" + aId
    rediscli.get(key, function(err, result) {
        if(err) {
            console.log('Error while retrieving key from redis : ' + key, err)
        } else {
            console.log('rGCM update: Token Found', result);
            console.log('rGCM update: Account Id', aId);
            User.findAsync({
                accountId: aId
            }).then(function(users) {
                if(users.length) {
                    console.log('rGCM update: User Found');
                    users[0].rgcm = '"' + result + '"';
                    console.log('Saving User', users[0].accountId)
                    users[0].saveAsync().then(function(res) {
                        //console.log('rGCM ID Updated!', res)
                    }).
                    catch(function(err) {
                        console.log('User Save Error', err)
                    });
                } else {
                    console.log('rGCM update User Not Found', users)
                }
            }).
            catch(function(err) {
                console.log('rGCM update User Find Error', err)
            })
        }
    });
}
exports.updateGCMFromRedis = updateGCMFromRedis;
exports.updatePassword = function(aId, password, personName) {
    var key = "gcm:" + aId
    rediscli.get(key, function(err, result) {
        if(err) {
            throw err
        } else {
            User.findAsync({
                accountId: aId
            }).then(function(users) {
                if(users.length) {
                    var salt = bcrypt.genSaltSync(10);
                    var hash = bcrypt.hashSync(password, salt);
                    users[0].password = hash;
                    users[0].active = true;
                    users[0].new = false;
                    if(personName != null) users[0].personName = personName;
                    users[0].saveAsync().then(function(res) {
                        //console.log('Updated!', res)
                    }).
                    catch(function(err) {
                        console.log('Error', err)
                    });
                }
            }).
            catch(function(err) {
                console.log('User Find Error', err)
            })
        }
    });
}
exports.updateImage = function(aId, personPhoto) {
    User.findAsync({
        accountId: aId
    }).then(function(users) {
        if(users.length) {
            users[0].personPhoto = personPhoto;
            users[0].saveAsync().then(function(res) {
                //console.log('Updated!', res)
            }).
            catch(function(err) {
                console.log('Error', err)
            });
        }
    }).
    catch(function(err) {
        console.log('Image Update Find Error', err)
    })
}