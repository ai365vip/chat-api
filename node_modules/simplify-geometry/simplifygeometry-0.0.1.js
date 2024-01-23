(function(e){if("function"==typeof bootstrap)bootstrap("simplifygeometry",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeSimplifyGeometry=e}else"undefined"!=typeof window?window.simplifyGeometry=e():global.simplifyGeometry=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var Line = require('./line');

var simplifyGeometry = function(points, tolerance){

  var dmax = 0;
  var index = 0;

  for (var i = 1; i <= points.length - 2; i++){
    d = new Line(points[0], points[points.length - 1]).perpendicularDistance(points[i]);
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

},{"./line":2}],2:[function(require,module,exports){
var Line = function(p1, p2){

  this.p1 = p1;
  this.p2 = p2;

};

Line.prototype.rise = function() {

  return this.p2[1] - this.p1[1];

};

Line.prototype.run = function() {

  return this.p2[0] - this.p1[0];

};

Line.prototype.slope = function(){

  return  this.rise() / this.run();

};

Line.prototype.yIntercept = function(){

  return this.p1[1] - (this.p1[0] * this.slope(this.p1, this.p2));

};

Line.prototype.isVertical = function() {

  return !isFinite(this.slope());

};

Line.prototype.isHorizontal = function() {

  return this.p1[1] == this.p2[1];

};

Line.prototype._perpendicularDistanceHorizontal = function(point){

  return Math.abs(this.p1[1] - point[1]);

};

Line.prototype._perpendicularDistanceVertical = function(point){

  return Math.abs(this.p1[0] - point[0]);

};

Line.prototype._perpendicularDistanceHasSlope = function(point){
  var slope = this.slope();
  var y_intercept = this.yIntercept();

  return Math.abs((slope * point[0]) - point[1] + y_intercept) / Math.sqrt((Math.pow(slope, 2)) + 1);

};

Line.prototype.perpendicularDistance = function(point){
  if (this.isVertical()) {

    return this._perpendicularDistanceVertical(point);

  }

  else if (this.isHorizontal()){

    return this._perpendicularDistanceHorizontal(point);

  }

  else {

    return this._perpendicularDistanceHasSlope(point);

  }

};

module.exports = Line;

},{}]},{},[1])(1)
});
;