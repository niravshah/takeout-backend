var exports = module.exports = {};
var redis = require("redis");
var bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var rediscli = redis.createClient();
var geocoder = require('geocoder');
var _ = require('underscore');
var aSync = require('async');
var level = require("level-browserify");
var levelgraph = require("levelgraph");
var db = levelgraph(level("postcodes"));
var geoLib = require('geolib');
var jobs = require('./jobs-module.js');
var nots = require('./notifications-module.js');

exports.getAllAvailableGrids = function(service) {
    var key = "ninja:available:" + service + ":*"
    return rediscli.keysAsync(key);
};

exports.getGridNinjas = function(service, grid) {
    return rediscli.smembersAsync("ninja:available:" + service + ":" + grid);
};

exports.getNinjaInfo = function(ninjaid) {
    var key1 = "ninja:" + ninjaid + ":*" + ":status";
    var key2 = "ninja:" + ninjaid + ":location";
    var key3 = "ninja:" + ninjaid + ":grid";
    return rediscli.mgetAsync([key1, key2, key3])
};

exports.markNinjaAvailableWithLatLng = function(ninjaid, service, latd, lngd, finalCallback) {
    aSync.waterfall([
        function(callback) {
            reverseGeocode(latd, lngd, callback)
        },
        function(postcode, callback) {
            postcodeToGrid(postcode, callback)
        },
        function(grid, callback) {
            var key = "ninja:available:" + service + ":" + grid;
            var value = "ninja:" + ninjaid + ":location"
            rediscli.sadd(key, value);
            var key2 = "ninja:" + ninjaid + ":" + service + ":status";
            var val2 = "available";
            var key3 = "ninja:" + ninjaid + ":location";
            var val3 = ninjaid + ":" + latd + ":" + lngd;
            var key4 = "ninja:" + ninjaid + ":grid";
            var val4 = grid;
            var key5 = "ninja:" + ninjaid + ":" + service + ":strikes";
            var val5 = "0";
            rediscli.set(key2, val2);
            rediscli.set(key3, val3);
            rediscli.set(key4, val4);
            rediscli.set(key5, val5);
            finalCallback(key);
        }
    ]);
};
var markNinjaUnavailable = function(ninjaid, service) {
    var key1 = "ninja:" + ninjaid + ":" + service + ":status";
    var val1 = "unavailable";
    rediscli.set(key1, val1);
    var key2 = "ninja:" + ninjaid + ":grid";
    return rediscli.getAsync(key2).then(function(grid) {
        var key3 = "ninja:available:" + service + ":" + grid;
        var val3 = "ninja:" + ninjaid + ":location"
        return rediscli.sremAsync(key3, val3)
    })
};

exports.markNinjaUnavailable = markNinjaUnavailable

var markNinjaAvailable = function(ninjaid, service) {
    var key1 = "ninja:" + ninjaid + ":" + service + ":status";
    var val1 = "available";
    rediscli.set(key1, val1);
    var key2 = "ninja:" + ninjaid + ":grid";
    return rediscli.getAsync(key2).then(function(grid) {
        var key3 = "ninja:available:" + service + ":" + grid;
        var val3 = "ninja:" + ninjaid + ":location"
        return rediscli.saddAsync(key3, val3)
    })
};

exports.markNinjaAvailable = markNinjaAvailable;

exports.updateStrikesAndStatus = function(ninjaid, service) {
    var strike_key = "ninja:" + ninjaid + ":" + service + ":strikes";
    var status_key = "ninja:" + ninjaid + ":" + service + ":status";
    
    rediscli.incrAsync(strike_key).then(function(value){
        
        if(value>=3){            
            markNinjaUnavailable(ninjaid,service);
        }else{
            markNinjaAvailable(ninjaid,service);
        }
    }).catch(function(err){})
}

exports.getNinjaStatus = function(ninjaid, service, callback) {
    var key1 = "ninja:" + ninjaid + ":" + service + ":status";
    rediscli.get(key1, function(err, res) {
        if(err) callback(err, null);
        else callback(null, res)
    });
};
exports.findNinjaForJob = function(jobkey, service, requester, pickup_latd, pickup_lngd, drop_latd, drop_lngd, finalCallback) {
    aSync.waterfall([
        function(callback) {
            reverseGeocode(pickup_latd, pickup_lngd, callback)
        },
        function(postcode, callback) {
            console.log('Postcode', postcode)
            postcodeToGrid(postcode, callback)
        },
        function(grid, callback) {
            console.log('Grid', grid)
            gridToNinjaLocations(service, grid, callback);
        },
        function(gridNinjas, callback) {
            console.log('gridNinjas', gridNinjas)
            locationPoints(true, pickup_latd, pickup_lngd, gridNinjas, callback);
        },
        function(points, callback) {
            console.log('Points', points)
            var list = geoLib.orderByDistance(points['self'], points)
            console.log('List', list);
            var key = jobkey + ":ninja";
            var arr = [];
            list.forEach(function(ninja) {
                if(ninja['key'] != 'self') arr.push(ninja['key'])
            })
            console.log('Arr', arr)
            rediscli.rpush(key, arr, function(err, res) {
                rediscli.lpop(key, function(err, res) {
                    var key2 = jobkey + ":ninja:current";
                    rediscli.set(key2, res, function(err, res) {
                        if(err) {
                            console.log('ERROR - Setting Current Ninja:', err);
                        } else console.log("Current Ninja Set", res);
                        finalCallback(list)
                    });
                });
            });
        }
    ]);
}
exports.findNinjaNearby = function(service, pickup_latd, pickup_lngd, finalCallback) {
    aSync.waterfall([
        function(callback) {
            reverseGeocode(pickup_latd, pickup_lngd, callback);
        },
        function(postcode, callback) {
            postcodeToGrid(postcode, callback);
        },
        function(grid, callback) {
            if(grid != null) {
                gridToNinjaLocations(service, grid, callback);
            } else {
                //console.log("gridToNinjaLocations - no grid")
                callback(null, null, null)
            }
        },
        function(gridNinjas, grid, callback) {
            if(gridNinjas != null) {
                //console.log(gridNinjas,grid)
                locationPoints(false, pickup_latd, pickup_lngd, gridNinjas, callback, grid);
            } else {
                //console.log("locationPoints - no gridNinjas")
                callback([])
            }
        },
        function(list) {
            console.log("findNinjaNearby", list)
            finalCallback(list)
        }
    ]);
}
exports.requestPickup = function(jobkey, notsid) {
    var key = jobkey + ":ninja:current"
    rediscli.getAsync(key).then(function(result) {
        var gcmKey = "gcm:" + result;
        rediscli.getAsync(gcmKey).then(function(result) {
            console.log('Requesting Pickup for: ' + jobkey + ': from :' + result + " : " + key + ": gcm : " + result + " : gcmKey : " + gcmKey);
            rediscli.getAsync(jobkey).then(function(jobDetails) {
                nots.sendNotification(result, jobDetails,notsid)
            }).
            catch(function(err) {
                console.log('ERROR:', err)
            });
        }).
        catch(function(err) {
            console.log('ERROR:', err)
        })
    }).
    catch(function(err) {
        console.log('ERROR - requestPickup', err)
    });
}

exports.unRequestPickup = function(ninjaid, notsid){
    var gcmKey = "gcm:" + ninjaid;
    rediscli.getAsync(gcmKey).then(function(result) {        
        sendCancelNotification(result,notsid);        
    }).catch(function(err){})
};

exports.notifyJobRejected = function(requester_id, jobkey) {
    var gcmKey = "rgcm:" + requester_id;
    rediscli.getAsync(gcmKey).then(function(result) {
        rediscli.getAsync(jobkey).then(function(jobDetails) {
            nots.notifyJobRejected(result, jobDetails)
        }).
        catch(function(err) {
            console.log('ERROR:', err)
        });
    }).
    catch(function(err) {
        console.log('ERROR:', err)
    })
}
exports.notifyJobAccepted = function(requester_id, jobkey) {
    var gcmKey = "rgcm:" + requester_id;
    rediscli.getAsync(gcmKey).then(function(result) {
        rediscli.getAsync(jobkey).then(function(jobDetails) {
            nots.notifyJobAccepted(result, jobDetails)
        }).
        catch(function(err) {
            console.log('ERROR:', err)
        });
    }).
    catch(function(err) {
        console.log('ERROR:', err)
    })
}
var reverseGeocode = function(pickup_latd, pickup_lngd, callback) {
    geocoder.reverseGeocode(pickup_latd, pickup_lngd, function(err, data) {
        var list1 = _.find(data.results, function(dt) {
            if(_.indexOf(dt.types, 'postal_code') > -1) return true
        });
        var list2 = _.find(list1.address_components, function(dt) {
            if(_.indexOf(dt.types, 'postal_code') > -1) return true
        });
        callback(null, list2.long_name);
    });
}
exports.reverseGeocode = reverseGeocode
var postcodeToGrid = function(postcode, callback) {
    db.get({
        subject: postcode,
        predicate: 'grid'
    }, function(err, list) {
        if(list != null && list.length != 0) {
            callback(null, list[0].object);
        } else {
            callback(null, null)
        }
    });
}
exports.postcodeToGrid = postcodeToGrid
var gridToNinjaLocations = function(service, grid, callback) {
    var key = "ninja:available:" + service + ":" + grid;
    rediscli.smembers(key, function(err, list) {
        if(list.length > 0) {
            rediscli.mget(list, function(err, list) {
                callback(null, list, grid)
            });
        } else {
            callback(null, list, grid)
        }
    });
}
exports.gridToNinjaLocations = gridToNinjaLocations
var locationPoints = function(includeSelf, pickup_latd, pickup_lngd, gridNinjas, callback, grid) {
    var points = {}
    if(gridNinjas.length > 0) {
        if(includeSelf) {
            var pickup = {}
            pickup['latitude'] = pickup_latd;
            pickup['longitude'] = pickup_lngd;
            points['self'] = pickup;
        }
        //console.log(gridNinjas);
        _(gridNinjas).each(function(ninja, key) {
            console.log(ninja, key)
            var arr = ninja.split(":")
            var loc = {}
            loc['latitude'] = arr[1]
            loc['longitude'] = arr[2]
            points[arr[0]] = loc;
        });
    }
    //console.log(points);
    callback(null, points, grid);
}
exports.locationPoints = locationPoints