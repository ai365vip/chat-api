var assert = require("assert");
var Line = require("../lib/line");

describe('Line', function(){
  var line = new Line([1,-2], [2, -2.5]);

  it('should initialize with points', function(){
    assert.deepEqual(line.p1, [1, -2]);
    assert.deepEqual(line.p2, [2, -2.5]);
  });

  describe('#rise()', function(){
    it('should return the correct rise of the given line', function(){
      assert.equal(line.rise(), -0.5);
    });
  });

  describe('#run()', function(){
    it('should return the correct run of the given line', function(){
      assert.equal(line.run(), 1);
    });
  });

  describe('#slope()', function(){
    it('should return the correct slope of the given line', function(){
      assert.equal(line.slope(), -0.5);
    });
  });

  describe('#yIntercept()', function(){
    it('should return the correct y intercept of the given line', function(){
      assert.equal(line.yIntercept(), -1.5);
    });
  });

  describe('#isVertical()', function(){
    it('should return true if the line is vertical', function(){
      var vertical_line = new Line([0,0], [0, 5]);
      assert.equal(vertical_line.isVertical(), true);
    });

    it('should return false if the line is not vertical', function(){
      assert.equal(line.isVertical(), false);
    });
  });

  describe('#isHorizontal()', function(){
    it('should return true if the line is horizontal', function(){
      var horizontal_line = new Line([0,1], [6, 1]);
      assert.equal(horizontal_line.isHorizontal(), true);
    });

    it('should return false if the line is not vertical', function(){
      assert.equal(line.isHorizontal(), false);
    });
  });

  describe('#_perpendicularDistanceHasSlope()', function(){
    it('should return the correct perpendicular distance of a given point from the given line with slope', function(){
      assert.equal(line._perpendicularDistanceHasSlope([1,2]), 8 / Math.sqrt(5));
    });
  });

  describe('#_perpendicularDistanceVertical()', function(){
    it('should return the correct perpendicular distance of a given point from the given vertical line', function(){
      var vertical_line = new Line([0,0], [0, 5]);
      assert.equal(vertical_line._perpendicularDistanceVertical([3,2]), 3);
    });
  });

  describe('#_perpendicularDistanceHorizontal()', function(){
    it('should return the correct perpendicular distance of a given point from the given horizontal line', function(){
      var horizontal_line = new Line([0,1], [6, 1]);
      assert.equal(horizontal_line._perpendicularDistanceHorizontal([3,2]), 1);
    });
  });

  describe('#perpendicularDistance()', function(){
    it('should return the correct perpendicular distance if line has a slope', function(){
      assert.equal(line.perpendicularDistance([1,2]), line._perpendicularDistanceHasSlope([1,2]));
    });

    it('should return the correct perpendicular distance if line is horizontal', function(){
      var vertical_line = new Line([0,0], [0, 5]);
      assert.equal(vertical_line.perpendicularDistance([3,2]), vertical_line._perpendicularDistanceVertical([3,2]));
    });

    it('should return the correct perpendicular distance if line is vertical', function(){
      var horizontal_line = new Line([0,1], [6, 1]);
      assert.equal(horizontal_line.perpendicularDistance([3,2]), horizontal_line._perpendicularDistanceHorizontal([3,2]));
    });
  });

});
