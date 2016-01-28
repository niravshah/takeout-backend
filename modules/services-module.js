var exports = module.exports = {};
var Service = require('../models/service');
var Market = require('../models/marketplace');
exports.setAllServices = function(rC, eC) {
    var services = []
    var newService = Service({
        serviceId: 's1',
        serviceName: 'Food Delivery',
        serviceDescription: 'Look for drivers to take your takeaway orders to your customers',
        servicePhoto: 'http://res.cloudinary.com/specky/image/upload/v1453847455/food_delivery_bdutt5.jpg',
        active: true,
        new: false
    });
    newService.saveAsync().then(function(result) {
        rC(result)
    }).
    catch(function(err) {
        eC(err)
    })
    var newService2 = Service({
        serviceId: 's2',
        serviceName: 'Parcel Delivery',
        serviceDescription: 'Look for drivers to help deliver your parcels',
        servicePhoto: 'http://res.cloudinary.com/specky/image/upload/v1453847453/Delivery_boy_S_bbm6ru.jpg',
        active: true,
        new: false
    });
    newService2.saveAsync().then(function(result) {
        rC(result)
    }).
    catch(function(err) {
        eC(err)
    })
}
exports.createService = function(mId, sId, sName, sDesc, sPhoto, active, sNew) {
    return Market.findAsync({
        shortId: mId
    }).then(function(data) {
        var newService2 = Service({
            serviceId: sId,
            serviceName: sName,
            serviceDescription: sDesc,
            servicePhoto: sPhoto,
            active: active,
            new: true,
            marketplace: data[0]._id
        });
        return newService2.saveAsync();
    }).
    catch(function(error) {
        console.log("ERROR:Create Service Errror")
    })
}
exports.getAllServices = function(rC, eC) {
    Service.findAsync({}).then(function(docs) {
        rC(docs)
    }).
    catch(function(err) {
        eC(err)
    });
}
exports.getAllServicesAsync = function() {
    return Service.find({}).populate('marketplace').execAsync();
}

exports.getAllServicesByMarketplaceAsync = function(m1) {
    return Service.find({marketplace : m1}).populate('marketplace').execAsync();
}