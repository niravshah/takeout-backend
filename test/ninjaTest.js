var nJ = require('./../ninja.js');
var aSync = require('async');
var chai = require("chai");
var expect = chai.expect;

describe("Ninja", function() {
  describe("#getAllAvailableGrids()", function() {
    it("should give a list of all grids having available ninjas", function() {        
        return nJ.getAllAvailableGrids().then(function(val){expect(val).to.have.length(23)});        
    });
    
  });
});