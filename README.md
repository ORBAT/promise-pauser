# promise-pauser

Promise-pauser is a Node library for pausing multiple promise chains and/or streams with one call. Allows pausing already started promise chains / streams at controllable points, making it easy to halt multiple concurrent processes when a certain network resource goes down.

The end result is similar to RxJS's `Pauser`.

# Examples

Also in the [/examples](/examples) directory.

## With multiple promise chains

```javascript
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

```

## Streams

You can also use promise-pauser to pause multiple [Highland](http://highlandjs.org/) streams with one call.

```javascript
var Promise = require('bluebird');
var $ = require('highland');
var pause = require('promise-pauser');

var pauser = pause.pauser();

var str1 = $([1,2,3,4,5,6,7,8]).ratelimit(1, 500)
  .flatMap($.compose($, pause.waitFor(pauser))) // pause _before_ the map
  .map($.add(5))
  .each($.partial($.log, "str1 end"));

/*
    $.compose($, pause.waitFor(pauser)) ==

    function(x) {
      return $(pause.waitFor(pauser)(x))
    }
*/

var str2 = $([10,20,30,40,50]).ratelimit(1, 500)
  .map($.add(100))
  .doto($.partial($.log, "after str2 map"))
  .flatMap($.compose($, pause.waitFor(pauser))) // note that the pause is 
                                                // _after_ the map
  .each($.partial($.log, "str2 end"));

setTimeout($.compose(pauser.pause, $.partial($.log, "\npaused\n")), 1050);
setTimeout($.compose(pauser.unpause, $.partial($.log, "\nunpause\n")), 3000);

```