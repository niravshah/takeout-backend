var fs = require('fs');
var parse = require('csv-parse');

var level = require("level-browserify");
var levelgraph = require("levelgraph");
var db = levelgraph(level("postcodes"));

var parser = parse({delimiter: ','}, function(err, data){
    if(err) console.log(err);
    data.forEach(function(dt){
      
      var str1 = dt[5].substring(0,4);
      var str2 = dt[5].substring(5,7);
      var gridref = str1.concat(str2);

      var str3 = dt[5].substring(0,3);
      var str4 = dt[5].substring(5,6);
      var parentGridRef = str3.concat(str4);
      
      var grid = {};
      grid['subject'] = dt[0];
      grid['predicate'] = 'grid';
      grid['object'] = gridref;
      
      var pGrid = {};
      pGrid['subject'] = dt[0];
      pGrid['predicate'] = 'pGrid';
      pGrid['object'] = parentGridRef;

      
      var lat = {};
      lat['subject'] = dt[0];
      lat['predicate'] = 'latitude';
      lat['object'] = dt[1];
      
      var lng = {};
      lng['subject'] = dt[0];
      lng['predicate'] = 'longitude';
      lng['object'] = dt[2];      
      
      db.put([grid,pGrid,lat,lng], function(err) {
        console.log('Error while adding Triple:',err,grid)
      });
    });
  
    console.log('DB Updated!');
});


var express = require('express');
var app = express();

app.get('/', function (req, res) {
  
  db.get({subject:'NW9 5US'},function(err,list){
    res.send(list);  
  })
  
});

var server = app.listen(6000, function () {
  var host = server.address().address;
  var port = server.address().port;
  fs.createReadStream(__dirname+'/nw.csv').pipe(parser);
  console.log('Example app listening at http://%s:%s', host, port);
});