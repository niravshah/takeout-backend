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
var jobs = require('./jobs.js');

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

exports.markNinjaUnavailable = function(ninjaid, service) {
  var key1 = "ninja:" + ninjaid + ":" + service + ":status";
  var val1 = "unavailable";
  rediscli.set(key1, val1);
  var key2 = "ninja:" + ninjaid + ":grid";
  return rediscli.getAsync(key2).then(function(grid) {
    var key3 = "ninja:available:" + service + ":" +  grid;
    var val3 = "ninja:" + ninjaid + ":location"
    return rediscli.sremAsync(key3, val3)
  })
};

exports.markNinjaAvailable = function(ninjaid, service, latd, lngd, finalCallback) {
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
      rediscli.set(key2, val2);
      rediscli.set(key3, val3);
      rediscli.set(key4, val4);
      finalCallback(key);
    }
  ]);
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
      gridToNinjaLocations(service,grid, callback);
    },
    function(gridNinjas, callback) {
        console.log('gridNinjas', gridNinjas)
      locationPoints(true, pickup_latd, pickup_lngd, gridNinjas, callback);
    },
    function(points, callback) {
      console.log('Points',points)
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
      }
    },
    function(gridNinjas, callback) {
      if(gridNinjas != null) {
        locationPoints(false, pickup_latd, pickup_lngd, gridNinjas, callback);
      }
    },function(list){
        finalCallback(list)
    }
  ]);
}
exports.requestPickup = function(jobkey) {
  //this function needs to sendout a GCM Message    
  var key = jobkey + ":ninja:current"
  rediscli.get(key, function(err, result) {
    console.log('Requesting Pickup for: ' + jobkey + ': from :' + result);
  })
}
exports.rejectJob = function(jobkey) {
  rediscli.get(jobkey + ":ninja:current", function(err, result) {
    jobs.updateJobStatus(jobkey, "Pickup Rejected");
    rediscli.lpop(jobkey + ":ninja", function(err, res) {
      rediscli.set(jobkey + ":ninja:current", res, function(err, result) {
        exports.requestPickup(jobkey)
      })
    })
  })
}

function reverseGeocode(pickup_latd, pickup_lngd, callback) {
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

function postcodeToGrid(postcode, callback) {
  db.get({
    subject: postcode,
    predicate: 'grid'
  }, function(err, list) {
    if(list != null && list.length != 0){
      callback(null, list[0].object);
    }else{
      callback(null,null)
    }
  });
}

function gridToNinjaLocations(service, grid, callback) {
  var key = "ninja:available:" + service + ":" + grid;
  rediscli.smembers(key, function(err, list) {
    rediscli.mget(list, function(err, list) {
      callback(null, list)
    });
  });
}

function locationPoints(includeSelf, pickup_latd, pickup_lngd, gridNinjas, callback) {
  var points = {}
  if(includeSelf) {
    var pickup = {}
    pickup['latitude'] = pickup_latd;
    pickup['longitude'] = pickup_lngd;
    points['self'] = pickup;
  }
  //console.log(gridNinjas);
  _(gridNinjas).each(function(ninja, key) {
    //console.log(ninja)
    var arr = ninja.split(":")
    var loc = {}
    loc['latitude'] = arr[1]
    loc['longitude'] = arr[2]
    points[arr[0]] = loc;
  });
  console.log(points);
  callback(null, points);
}