module.exports = function() {
  var that = this;
  return new Promise(function read(resolve, reject) {
    var buffer = that._stream.read();
    if (buffer != null) return resolve({done: false, value: buffer});
    that._readable.then(function(done) { return done ? resolve({done: true, value: undefined}) : read(resolve, reject); }).catch(reject);
  });
};
