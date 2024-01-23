var Line = require('./line');

var simplifyGeometry = function(points, tolerance){

  var dmax = 0;
  var index = 0;

  for (var i = 1; i <= points.length - 2; i++){
    var d = new Line(points[0], points[points.length - 1]).perpendicularDistance(points[i]);
    if (d > dmax){
      index = i;
      dmax = d;
    }
  }

  if (dmax > tolerance){
    var results_one = simplifyGeometry(points.slice(0, index), tolerance);
    var results_two = simplifyGeometry(points.slice(index, points.length), tolerance);

    var results = results_one.concat(results_two);

  }

  else if (points.length > 1) {

    results = [points[0], points[points.length - 1]];

  }

  else {

    results = [points[0]];

  }

  return results;


}

module.exports = simplifyGeometry;
