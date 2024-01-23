var assert = require("assert");
var simplify = require("../lib/index");

describe('Simplify Geometry', function(){
  var mock_points = [[0, 0], [2.5, 3], [5, 0]];

  it('should return all of the points if they are all within the tolerance threshold', function(){
    assert.deepEqual(simplify(mock_points, 2.9), mock_points);
  });

  it('should remove all points not within the tolerance threshold', function(){
    assert.deepEqual(simplify(mock_points, 3), [[0,0], [5,0]]);
  });

});
