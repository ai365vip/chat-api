var fs = require("fs"),
    stream = require("stream-source");

module.exports = function(path, options) {
  var highWaterMark = 65536;
  if (options && options.highWaterMark != null) highWaterMark = options.highWaterMark;
  return new Promise(function(resolve, reject) {
    var f = fs.createReadStream(path, {highWaterMark: highWaterMark});
    f.once("open", function() { resolve(stream(f)); });
    f.once("error", reject);
  });
};
