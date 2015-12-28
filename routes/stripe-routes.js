var stripe = require('../modules/stripe-module.js');


module.exports = function(app) {    
    app.post('/api/stripe/:acctid/token', function(req, res){                        
      stripe.createCustomer(req.body.stripeToken,req.params.acctid, function(err, result){
          if(err) {
              console.log('createCustomer Error', err)
              res.status(500).send(err)
          }
          else res.status(200).send(result)
      })        
    });
    
     app.get('/api/stripe/connect/:acctId/new',function(req,res){            
        stripe.createNewStandaloneAccount(req.params.acctId, 'nirav.n@gs.com', function(err, result){
            if(err) res.status(500).send(err)
            else res.status(200).send(result)
        })    
    });
    
    app.get('/api/stripe/charge/:cust_acctid/:amt/:curr/:reciever_acctid',function(req,res){        
        stripe.chargeCustomer(req.params.cust_acctid,req.params.amt,req.params.curr, req.params.reciever_acctid, function(err, result){
            if(err) res.status(500).send(err)
            else res.status(200).send(result)
        })        
    });
    
   
}