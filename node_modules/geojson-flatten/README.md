# geojson-flatten

[![CircleCI](https://circleci.com/gh/tmcw/geojson-flatten/tree/master.svg?style=svg)](https://circleci.com/gh/tmcw/geojson-flatten/tree/master)

Flatten MultiPoint, MultiPolygon, MultiLineString, and GeometryCollection
geometries in [GeoJSON](http://geojson.org/) files into simple non-complex
geometries.

## install

```
npm install --save geojson-flatten
```

Or download `geojson-flatten.js` for non-[browserify](http://browserify.org/) usage.

## example

```js
let flatten = require('geojson-flatten');

flattened = flatten(geojsonObject);
```

## cli

With a file input

```
$ geojson-flatten input.geojson > flattened.geojson
```

With stdin

```
$ geojson-random | geojson-flatten > flattened.geojson
```
