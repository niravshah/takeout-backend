var fs = require('fs');
var parse = require('csv-parse');

var level = require("level-browserify");
var levelgraph = require("levelgraph");
var db = levelgraph(level("postcodes"));

var parser = parse({delimiter: ','}, function(err, data){
    if(err) console.log(err);
    data.forEach(function(dt){
      var grid = {};
      grid['subject'] = dt[0];
      grid['predicate'] = 'grid';
      grid['object'] = dt[5];
      
      var lat = {};
      lat['subject'] = dt[0];
      lat['predicate'] = 'latitude';
      lat['object'] = dt[1];
      
      var lng = {};
      lng['subject'] = dt[0];
      lng['predicate'] = 'longitude';
      lng['object'] = dt[2];      
      
      db.put([grid,lat,lng], function(err) {
        console.log('Error while adding Triple:',err,grid)
      });    
    });
    console.log('DB Updated!');
});

//fs.createReadStream(__dirname+'/nw.csv').pipe(parser);


var express = require('express');
var app = express();

app.get('/', function (req, res) {
  
  db.get({subject:'NW9 5US'},function(err,list){
    res.send(list);  
  })
  
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});