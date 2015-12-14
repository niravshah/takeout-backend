var stripe = require('../modules/stripe-module.js');


module.exports = function(app) {    
    app.post('/api/stripe/:acctid/token', function(req, res){                        
      stripe.createCustomer(req.body.stripeToken,req.params.acctid, function(err, result){
          if(err) res.status(500).send(err)
          else res.status(200).send(result)
      })        
    });
    
    app.get('/api/stripe/charge/:custid/:amt/:curr/:recieverid',function(req,res){        
        stripe.chargeCustomer(req.params.custid,req.params.amt,req.params.curr, req.params.recieverid, function(result){res.status(200).send(result)})        
    });
    
    app.get('/api/stripe/connect/:acctId/new',function(req,res){            
        stripe.createNewStandaloneAccount(req.params.acctId, 'nirav.n@gs.com', function(err, result){
            if(err) res.status(500).send(err)
            else res.status(200).send(result)
        })    
    });
}