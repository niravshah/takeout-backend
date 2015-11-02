var exports = module.exports = {};

var redis = require("redis"),
    rediscli = redis.createClient();
var geocoder = require('geocoder');
var _ = require('underscore');
var aSync = require('async');
var level = require("level-browserify");
var levelgraph = require("levelgraph");
var db = levelgraph(level("postcodes"));


exports.findAvailable = function(callback){
  rediscli.keys("ninja:available:*",function(err,list){callback(list)})
};

exports.markAvailable = function(ninjaid,latd,lngd,finalCallback){
  
  aSync.waterfall([
    function(callback){
      geocoder.reverseGeocode( latd, lngd, function ( err, data ) {
        var list1 = _.find(data.results, function(dt){if (_.indexOf(dt.types,'postal_code') > -1) return true});
        var list2 = _.find(list1.address_components,function(dt){if (_.indexOf(dt.types,'postal_code') > -1) return true});
        callback(null,list2.long_name);
      });
    }, function(postcode,callback){
        db.get({subject:postcode,predicate:'grid'},function(err,list){
          callback(null,list[0].object);  
        })
    }, function(grid,callback){
      var key = "ninja:available:" + grid;
      var value = "ninja:"+ ninjaid +":location"
      rediscli.sadd(key,value);
      
      var key2 = "ninja:"+ ninjaid +":status";
      var val2 = "available";
      var key3 = "ninja:"+ ninjaid +":location";
      var val3 = ninjaid + ":" + latd + ":" + lngd;
      
      rediscli.set(key2, val2);
      rediscli.set(key3, val3);
      finalCallback(key);
      
    }
  ]);        

}

