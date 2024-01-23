module.exports = function() {
  var stream = this._stream;
  return new Promise(function(resolve) {
    if (stream.destroyed) return resolve();
    stream.once("close", resolve).destroy();
  });
};
