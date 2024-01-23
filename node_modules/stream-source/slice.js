module.exports = function(length) {
  if ((length |= 0) < 0) throw new Error("invalid length");
  var that = this;
  return new Promise(function slice(resolve, reject) {
    if (length === 0) return resolve(that._stream.destroyed ? null : new Buffer(0));
    var buffer = that._stream.read(length);
    if (buffer != null) return resolve(buffer);
    that._readable.then(function(done) { return done ? resolve(null) : slice(resolve, reject); }).catch(reject);
  });
};
