var exports = module.exports = {};
var Market = require('../models/marketplace');

exports.getAllMarketsAsync = function(rC, eC) {
    return Market.findAsync({});       
}

exports.getMarketById = function(id){
    return Market.findAsync({shortId:id});  
}

exports.createMarket = function(sId,sName,sDesc){
     var newMarket = Market({
        shortId: sId,
        name: sName,        
        description: sDesc
    });
    return newMarket.saveAsync();
}