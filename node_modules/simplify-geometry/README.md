# simplify-geometry
[![Build Status](https://travis-ci.org/seabre/simplify-geometry.png)](https://travis-ci.org/seabre/simplify-geometry)

[![browser support](https://ci.testling.com/seabre/simplify-geometry.png)](https://ci.testling.com/seabre/simplify-geometry)

Simplify geometry using the [Ramer–Douglas–Peucker algorithm](http://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm).

If you need to simplify geometries, for instance reducing the number of points in a polygon, this will help you. You could use this in [Leaflet](https://github.com/Leaflet/Leaflet).

## Node

### Example

```javascript
var simplify = require('simplify-geometry');
var linestring = [[0,0], [2.5,3], [5,0]];

console.log(simplify(linestring, 2.9));
console.log(simplify(linestring, 3));
```

Output:
```javascript
[ [ 0, 0 ], [ 2.5, 3 ], [ 5, 0 ] ]
[ [ 0, 0 ], [ 5, 0 ] ]
```

## Browser

Browser builds are built with [Browserify](https://github.com/substack/node-browserify), and tested in various browsers with [Testling](https://ci.testling.com/):

* https://github.com/seabre/simplify-geometry/blob/master/simplifygeometry-0.0.2.js
* https://github.com/seabre/simplify-geometry/blob/master/simplifygeometry-0.0.2.min.js

You can see an example here, which uses Leaflet: http://seabre.github.io/simplify-geometry/

With example code here: https://github.com/seabre/simplify-geometry/tree/master/examples/browser


## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)
