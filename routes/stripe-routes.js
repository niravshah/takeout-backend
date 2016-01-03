var stripe = require('../modules/stripe-module.js');


module.exports = function(app) {    
    app.post('/api/stripe/:acctid/token', function(req, res){                        
      stripe.createCustomer(req.body.stripeToken,req.params.acctid, function(err, result){
          if(err) {
              console.log('createCustomer Error', err)
              res.status(500).send(err)
          }
          else{ 
              res.setHeader('Cache-Control', 'no-cache');
              res.status(200).send(result)
          }
      })        
    });
    
     app.post('/api/stripe/connect/:acctId/new',function(req,res){            
        stripe.createNewStandaloneAccount(req.params.acctId, req.body.email, function(err, result){
            if(err){
                res.status(err.status).send(err.message)
            }
            else{
                console.log('Result', result)
                res.status(200).send(result)
            }
        })    
    });
    
    app.post('/api/stripe/charge/:cust_acctid/:amt/:curr/:reciever_acctid',function(req,res){
        stripe.chargeCustomer(req.params.cust_acctid,req.params.amt,req.params.curr, req.params.reciever_acctid, req.body.jobIds, function(err, result){
            if(err) res.status(500).send(err)
            else res.status(200).send(result)
        })        
    });
    
    app.post('/api/webhook/stripe',function(req,res){        
        var event_json = req.body;
        stripe.processWebhook(event_json)
        res.status(200).send();
    });    
    
   
}