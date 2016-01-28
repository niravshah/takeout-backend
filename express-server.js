var express = require('express');
var bodyParser = require('body-parser')
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var config = require('./config');
var path = require('path')
var app = express();


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//JWT Middleware
app.set('superSecret', config.secret); 

var swig  = require('swig');
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });

app.use(express.static(path.join(__dirname, 'public_html')));

app.use('/api/stripe',function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });    
  }
});

var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'presto',
    streams: [
        {
            type: 'rotating-file',
            path: '/home/codio/workspace/logs/presto-log.log',
            period: '1d', 
            count: 3     
        },        
        {
            type: "raw",
            stream: require('bunyan-logstash').createStream({
                host: '127.0.0.1',
                port: 5505
            })
        }
    ]
});



var commonRoutes = require('./routes/common-routes.js')(app);
var ninjaRoutes = require('./routes/ninja-routes.js')(app);
var gridRoutes = require('./routes/grid-routes.js')(app);
var jobRoutes = require('./routes/job-routes.js')(app);
var jobFsmRoutes = require('./routes/jobs-fsm-routes.js')(app,log);
var serviceRoutes = require('./routes/service-routes.js')(app);
var twilioRoutes = require('./routes/twilio-routes.js')(app);
var postcodeRoutes = require('./routes/postcode-routes.js')(app);
var stripeRoutes = require('./routes/stripe-routes.js')(app);
var ratingsRoutes = require('./routes/ratings-routes.js')(app,log);
var ratingsRoutes = require('./routes/market-routes.js')(app);
var ratingsRoutes = require('./routes/pf-routes.js')(app);


app.get('/api', function(req, res) {
    var arr = []
    app._router.stack.forEach(function(each) {
        if(each.route != null) arr.push(each.route.path)
    })
    res.status(200).send(arr);
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});