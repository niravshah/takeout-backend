var exports = module.exports = {};
var createError = require('http-errors');

var stripe = require("stripe")("sk_test_aTh0omXn80N08tMdm2UKpyrC");
var aSync = require('async');
var User = require('./../models/user');
var Customer = require('./../models/customer');
var Job = require('../models/job');

var nots = require('./notifications-module');
var redis = require("redis");
var rediscli = redis.createClient();

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
                    console.log('Saved User', savedUser);
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
    console.log(accountId,email)
    var aid = 'acct_17NNWSIGpyMcxPEe';
    var account = "{id:'acct_17NNWSIGpyMcxPEe',object:'account',business_logo:null,business_name:null,business_url:null,charges_enabled:true,country:'GB',currencies_supported:['usd','aed','afn','all','vuv','wst','xaf','xcd','xof','xpf','yer','zar','zmw'],default_currency:'gbp',details_submitted:false,display_name:null,email:'gdn.amigo@gmail.com',keys:{secret:'sk_test_gU9TMoJzJ64F3HKn0ByZYI40',publishable:'pk_test_h2OQQUMGP5Na0ifPWiMn6B0F'},managed:false,metadata:{},statement_descriptor:null,support_phone:null,timezone:'Etc/UTC',  transfers_enabled: false }";
    
    
    User.findAsync({
        accountId: accountId
    }).then(function(users) {
        if(users.length) {
            users[0].stripe_connected = true;
            users[0].stripe_account=account.id;
            users[0].saveAsync().then(function(savedUser) {
                var newCustomer = Customer({
                    accountId: accountId,
                    saccountId: aid,
                    customerId: null,
                    sourceId: null
                });
                newCustomer.saveAsync().then(function(newCustomer) {
                    rC(null, account)
                }).
                catch(function(err) {
                    console.log('Error')
                    rC(new Error('Error saving Customer'), null);
                })
            })
        }
    }).
    catch(function(err) {
        console.log(err)
        rC(new Error('Error Updating User'), null)
    });    
    
    
    /*
    stripe.accounts.create({
        managed: false,
        country: 'GB',
        email: email
    }).then(function(account) {
        console.log(account)
        User.findAsync({
            accountId: accountId
        }).then(function(users) {
            if(users.length) {
                users[0].stripe_connected = true;
                users[0].stripe_account=account.id;
                users[0].saveAsync().then(function(savedUser) {
                    var newCustomer = Customer({
                        accountId: accountId,
                        saccountid: account.id,
                        customerId: null,
                        sourceId: null
                    });
                    newCustomer.saveAsync().then(function(newCustomer) {
                        rC(null, account)
                    }).
                    catch(function(err) {
                        console.log('Error')
                        rC(new Error('Error saving Customer'), null);
                    })
                })
            }
        }).
        catch(function(err) {
            console.log(err)
            rC(new Error('Error Updating User'), null)
        });
    }).
    catch(function(err) {
        console.log(err)
        if(err.statusCode == 400){
            rC(createError(400, err.message), null)
        }else{
            rC(new Error('Stripe Create Standalone Account Error'), null)
        }
    });*/
}
exports.chargeCustomer = function(custAcctId, amt, curr, recieverAcctId, jobIds, rC) {
    
    var cId = null;
    var sId = null;
    var rId = null;
    
    console.log('chargeCustomer', custAcctId, amt,curr,recieverAcctId)
    console.log('chargeCustomer - jobIds', jobIds[0]);
    
    aSync.parallel([
        function(callback) {
            Customer.findAsync({
                accountId: custAcctId
            }).then(function(customers) {
                if(customers.length) {
                    cId = customers[0].customerId;
                    sId = customers[0].sourceId;
                    console.log('Customer Found', cId, sId)
                    callback()
                }else{
                    console.log('Customer Not Found')
                }
            });
        },
        function(callback) {
            Customer.findAsync({
                accountId: recieverAcctId
            }).then(function(customers) {
                if(customers.length) {
                    rId = customers[0].saccountId;
                    console.log('Receiver Found', rId)
                    callback()
                }else{
                    console.log('Reciever Not Found')
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
            for(var i=0;i<jobIds.length;i++){
                Job.findAsync({
                    jobId: jobIds[i]
                }).then(function(jobs) {
                    if(jobs.length){
                        jobs[0].currentStatus = 'complete';
                        jobs[0].saveAsync().then(function(job){}).catch(function(err){})
                    }
                }).catch(function(err) {})
            };
            
            sendCustomerNotification(custAcctId);
            sendRecieverNotification(recieverAcctId);
            
            rC(null, charge)
        }).
        catch(function(err) {
            console.log('Error', err);
            rC(new Error('Error Processing Charge'), null)
        });
    });
}

var sendCustomerNotification = function(acct_id){
    var key = "rgcm:" + acct_id;
    rediscli.get(key,function(err,result){
        console.log('Sending Customer Notification for Charge Processed - ', result);
        nots.sendCustomerNotification(result,'Payment Successful');
    })
}

exports.sendCustomerNotification = sendCustomerNotification

var sendRecieverNotification = function(acct_id){
    var key = "gcm:" + acct_id;
    rediscli.get(key,function(err,result){
        console.log('Sending Reciever Notification for Payment Recieved - ', result);
        nots.sendRecieverNotification(result,'New Payment Recieved');
    });
}

exports.sendRecieverNotification = sendRecieverNotification

exports.processWebhook = function(event_json){
    console.log(event_json.data.object.verification);
}