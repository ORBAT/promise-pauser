var Promise = require('bluebird');

function defer() {
  var resolver;
  var p = new Promise(function (resolve) {resolver = resolve});
  return {resolve: resolver, promise: p};
}

/**
  Creates a new (unpaused) pauser object. It has the methods pause() and unpause(), and the
  property paused. When pause() is called, the paused property is set to a promise that will
  be resolved when unpause() is called.

  Calling pause when paused, or unpause when unpaused will result in an exception.
  */
function pauser() {
  var o =  {
    paused: false,
    pause: function pause() {
      if(this.paused) {
        throw new Error("pause() called while paused.");
      }
      var deferred = defer();
      this._resolve = deferred.resolve;
      this.paused = deferred.promise;
    },
    unpause: function unpause() {
      if(!this.paused) {
        throw new Error("unpause() called while not paused");
      }
      this._resolve();
      this.paused = false;
    }
  }

  o.pause = o.pause.bind(o);
  o.unpause = o.unpause.bind(o);
  return o;
}

exports.pauser = pauser;

/**
 * Takes a pauser object (or anyting with a pause property that is a Promise), and returns a function(a: A): Promise<A>
 * The returned promise will be either fulfilled with 'a' when the pause property is fulfilled, or immediately if the
 * pause property is falsy.
 *
 * Does no error handling.
 *
 * @param {Object} pauser A pauser object, either created with pauser() or anyting with a pause property that's
 * potentially a promise.
 * @return {Function}
 */
function waitFor(pauser) {
  return Promise.method(function(result) {
    if(pauser.paused) {
      return Promise.resolve(pauser.paused).return(result)
    }
    
    return result;
  });
}

exports.waitFor = waitFor;