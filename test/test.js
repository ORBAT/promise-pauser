var chai = require('chai');
var Promise = require('bluebird');
var expect = chai.expect;
chai.use(require("chai-as-promised"));
var pause = require('../');


function getSpy(name) {
  var called = false;
  var fn = function() {
    called = true;
  }

  fn.called = function() {
    return called;
  }

  fn.toString = function() {
    return "[Spy " + name + "]";
  }

  return fn;
}

function called(spy, b) {
  return function() {
    expect(spy.called(), spy).to.be.true;
  }
}

function notCalled(spy, b) {
  return function() {
    expect(spy.called(), spy).to.be.false;
  }
}

describe("promise-pauser", function(){
  it("should pause promise chains", function() {
    var pauser = pause.pauser();
    pauser.pause();
    var spy1 = getSpy("spy1");

    var chain1 = Promise.resolve("glerp").then(pause.waitFor(pauser)).tap(spy1);
    
    return Promise.delay(5).tap(notCalled(spy1));
  });

  it("should resume paused promise chains", function() {
    var pauser = pause.pauser();
    pauser.pause();
    var spy1 = getSpy("spy1");

    var chain1 = Promise.resolve("glerp").then(pause.waitFor(pauser)).tap(spy1);
    
    return Promise.delay(5).tap(notCalled(spy1)).tap(pauser.unpause.bind(pauser)).delay(5).tap(called(spy1));
  });

});