var exports = module.exports = {};

var redis = require("redis"),
    rediscli = redis.createClient();
var geocoder = require('geocoder');
var _ = require('underscore');
var aSync = require('async');
var level = require("level-browserify");
var levelgraph = require("levelgraph");
var db = levelgraph(level("postcodes"));
var geoLib = require('geolib');


exports.getAllAvailableGrids = function(callback){
  rediscli.keys("ninja:available:*",function(err,list){callback(list)})
};

exports.getAvailableGrid = function(grid,callback){  
  rediscli.smembers("ninja:available:" + grid,function(err,list){callback(list)})
};

exports.getNinjaInfo = function(ninjaid, callback){
  var key1 = "ninja:"+ ninjaid +":status";
  var key2 = "ninja:"+ ninjaid +":location";
  var key3 = "ninja:"+ ninjaid +":grid";
  rediscli.mget([key1, key2, key3],function(err, list){callback(list)})  
};

exports.markNinjaUnavailable = function(ninjaid, callback){  
  var key1 = "ninja:"+ ninjaid +":status";
  var val1 = "unavailable";
  rediscli.set(key1,val1)
  var key2 = "ninja:"+ ninjaid +":grid";
  rediscli.get(key2,function(err, grid){
    var key3 = "ninja:available:" + grid;
    var val3 = "ninja:"+ ninjaid +":location"
    rediscli.srem(key3,val3,function(err,res){
      if(err) callback('Error')
      else callback('Ninja marked Unavailable')      
    })
  }); 
};

exports.markNinjaAvailable = function(ninjaid,latd,lngd,finalCallback){  
  aSync.waterfall([
    function(callback){
      reverseGeocode(latd, lngd, callback)
    }, function(postcode,callback){
      postcodeToGrid(postcode,callback)
    }, function(grid,callback){
      var key = "ninja:available:" + grid;
      var value = "ninja:"+ ninjaid +":location"
      rediscli.sadd(key,value);      
      var key2 = "ninja:"+ ninjaid +":status";
      var val2 = "available";
      var key3 = "ninja:"+ ninjaid +":location";
      var val3 = ninjaid + ":" + latd + ":" + lngd;
      var key4 = "ninja:"+ ninjaid +":grid";
      var val4 = grid;      
      rediscli.set(key2, val2);
      rediscli.set(key3, val3);
      rediscli.set(key4, val4);      
      finalCallback(key);
    }
  ]);        
};

exports.findNinjaForJob = function(jobkey, requester, pickup_latd, pickup_lngd, drop_latd, drop_lngd, finalCallback){  
  aSync.waterfall([    
    function(callback){
      reverseGeocode(pickup_latd, pickup_lngd, callback)  
    }, function(postcode,callback){
      postcodeToGrid(postcode,callback)
    }, function(grid,callback){
      gridToNinjaLocations(grid, callback);
    },function(gridNinjas,callback){     
      locationPoints(true,pickup_latd,pickup_lngd,gridNinjas,callback);
    },function(points, callback){
      var list = geoLib.orderByDistance(points['self'],points)
      var key = jobkey + ":ninja:current";
      rediscli.set(key,list[1]['key']);      
      var key = jobkey + ":ninja";
      var arr = [];
      list.forEach(function(ninja){
        arr.push(ninja['key'])
      })
      rediscli.sadd(key,arr);      
      finalCallback(list)
    }
  ]);
}

exports.findNinjaNearby = function(pickup_latd,pickup_lngd, finalCallback){
  aSync.waterfall([    
    function(callback){
      reverseGeocode(pickup_latd, pickup_lngd, callback);
    }, function(postcode,callback){      
      postcodeToGrid(postcode,callback);
    }, function(grid,callback){      
      gridToNinjaLocations(grid, callback);
    },function(gridNinjas,callback){           
      locationPoints(pickup_latd,pickup_lngd,gridNinjas,callback);
    },function(points, callback){
      finalCallback(points);
    }
  ]);
}

exports.requestPickup = function(jobkey){ 
  //this function needs to sendout a GCM Message  
  console.log('Requesting Pickup!', jobkey);
}

exports.rejectJob = function(jobkey){  
  rediscli.get(jobkey + ":ninja", function(err,result){
    exports.updateJobStatus(jobkey,"Pickup Rejected");    
  })
}


function reverseGeocode(pickup_latd, pickup_lngd, callback){
  geocoder.reverseGeocode( pickup_latd, pickup_lngd, function ( err, data ) {
    var list1 = _.find(data.results, function(dt){if (_.indexOf(dt.types,'postal_code') > -1) return true});
    var list2 = _.find(list1.address_components,function(dt){if (_.indexOf(dt.types,'postal_code') > -1) return true});
    callback(null,list2.long_name);
  });        
}

function postcodeToGrid(postcode,callback){
  console.log(postcode);
  db.get({subject:postcode,predicate:'grid'},function(err,list){
    callback(null,list[0].object);
  });
}

function gridToNinjaLocations(grid,callback){
  var key = "ninja:available:" + grid;
  rediscli.smembers(key,function(err,list){
    rediscli.mget(list,function(err,list){
      callback(null,list)
    });
  });  
}

function locationPoints(includeSelf, pickup_latd,pickup_lngd,gridNinjas,callback){
  var points = {}
  if(includeSelf){
    var pickup = {}
    pickup['latitude'] = pickup_latd;
    pickup['longitude'] = pickup_lngd;
    points['self'] = pickup;
  }
  gridNinjas.forEach(function(ninja){
    var arr = ninja.split(":")
    var loc = {}
    loc['latitude'] = arr[1]
    loc['longitude'] = arr[2]
    points[arr[0]] = loc;
  });  
  callback(null,points);
}

