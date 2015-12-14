var exports = module.exports = {};
var stripe = require("stripe")("sk_test_aTh0omXn80N08tMdm2UKpyrC");
var User = require('./../models/user');
var User = require('./../models/customer');
exports.createCustomer = function(stripeToken, accountId, rC) {
    stripe.customers.create({
        source: stripeToken,
        description: accountId
    }).then(function(customer) {
        console.log(customer);
        User.findAsync({
            accountId: accountId
        }).then(function(users) {
            if(users.length) {
                users[0].active = true;
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
                        rC(null, savedUser)
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
                //save the new connected account to the user acctId
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
        }).catch(function(err) {
            rC(new Error('Error Updating User'), null)
        });
    }).catch(function(err) {
        rC(new Error('Stripe Charge Error'), null)
    });
}

exports.chargeCustomer = function(customerId, amt, curr, recieverId, rC) {
    stripe.charges.create({
        amount: amt,
        currency: curr,
        customer: customerId,
        source: 'card_7WykZ8lL2p11P8',
        destination: recieverId,
        application_fee: 200
    }).then(function(charge) {
        console.log('Success', charge);
        rC(charge)
    }).
    catch(function(err) {
        console.log('Error', err);
        rC(err)
    });
}