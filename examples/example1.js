var pause = require('promise-pauser');
var Promise = require('bluebird');

var pauser = pause.pauser();
pauser.pause();

var chain1 = Promise.resolve([1,2,3,4,5])
  .tap(console.log)
  .tap(pause.waitFor(pauser))
  .map(function(x){return x + 10;})
  .tap(console.log);

var chain2 = Promise.resolve([10,20,30,40,50])
  .tap(console.log)
  .tap(pause.waitFor(pauser))
  .map(function(x){return x + 1000;})
  .tap(console.log);

console.log("Unpausing in 3 seconds");

setTimeout(pauser.unpause, 3000);