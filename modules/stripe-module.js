var exports = module.exports = {};
var stripe = require("stripe")("sk_test_aTh0omXn80N08tMdm2UKpyrC");
var aSync = require('async');
var User = require('./../models/user');
var Customer = require('./../models/customer');
exports.createCustomer = function(stripeToken, accountId, rC) {
    console.log('createCustomer',stripeToken)
    stripe.customers.create({
        source: stripeToken,
        description: accountId
    }).then(function(customer) {
        console.log(customer);
        User.findAsync({
            accountId: accountId
        }).then(function(users) {
            if(users.length) {
                users[0].payment_verified = true;
                users[0].valid_till_m = customer.sources.data[0].exp_month;
                users[0].valid_till_y = customer.sources.data[0].exp_year;
                users[0].saveAsync().then(function(savedUser) {
                    var newCustomer = Customer({
                        accountId: accountId,
                        customerId: customer.sources.data[0].customer,
                        sourceId: customer.sources.data[0].id,
                        saccountId: null
                    });
                    newCustomer.saveAsync().then(function(newCustomer) {
                        rC(null, newCustomer[0])
                    }).
                    catch(function(err) {
                        rC(new Error('Error saving Customer'), null);
                    })
                });
            }
        }).
        catch(function(err) {
            rC(new Error('User Not Found Error'), null);
        });
    }).
    catch(function(err) {
        console.log(err);
        rC(new Error('Stripe Customer Create Error'), null);
    });
}
exports.createNewStandaloneAccount = function(accountId, email, rC) {
    stripe.accounts.create({
        managed: false,
        country: 'GB',
        email: email
    }).then(function(account) {
        User.findAsync({
            accountId: accountId
        }).then(function(users) {
            if(users.length) {
                users[0].connected = true;
                users[0].saveAsync().then(function(savedUser) {
                    var newCustomer = Customer({
                        accountId: accountId,
                        saccountId: account.id,
                        customerId: null,
                        sourceId: null
                    });
                    newCustomer.saveAsync().then(function(newCustomer) {
                        rC(null, savedUser)
                    }).
                    catch(function(err) {
                        rC(new Error('Error saving Customer'), null);
                    })
                })
            }
        }).
        catch(function(err) {
            rC(new Error('Error Updating User'), null)
        });
    }).
    catch(function(err) {
        rC(new Error('Stripe Create Standalone Account Error'), null)
    });
}
exports.chargeCustomer = function(custAcctId, amt, curr, recieverAcctId, rC) {
    
    var cId = null;
    var sId = null;
    var rId = null;
    
    aSync.parallel([
        function(callback) {
            Customer.findAsync({
                accountId: custAcctId
            }).then(function(customers) {
                if(customers.length) {
                    cId = customers[0].customerId;
                    sId = customers[0].sourceId;
                    callback()
                }
            });
        },
        function(callback) {
            Customer.findAsync({
                accountId: recieverAcctId
            }).then(function(customers) {
                if(customers.length) {
                    rId = customers[0].saccountId;
                    callback()
                }
            });
        }
    ], function(err) {
        stripe.charges.create({
            amount: amt,
            currency: curr,
            customer: cId,
            source: sId,
            destination: rId,
            application_fee: 200
        }).then(function(charge) {
            console.log('Success', charge);
            //TODO: Update Job Status            
            rC(null, charge)
        }).
        catch(function(err) {
            console.log('Error', err);
            rC(new Error('Error Processing Charge'), null)
        });
    });
}