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
