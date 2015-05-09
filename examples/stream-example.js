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
  .flatMap($.compose($, pause.waitFor(pauser))) // note that the pause is _after_ the map
  .each($.partial($.log, "str2 end"));

setTimeout($.compose(pauser.pause, $.partial($.log, "\npaused\n")), 1050);
setTimeout($.compose(pauser.unpause, $.partial($.log, "\nunpause\n")), 3000);