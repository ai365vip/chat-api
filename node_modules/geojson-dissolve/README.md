# geojson-dissolve

[![Build Status](https://img.shields.io/travis/digidem/geojson-dissolve.svg)](https://travis-ci.org/digidem/geojson-dissolve)
[![npm](https://img.shields.io/npm/v/geojson-dissolve.svg?maxAge=2592000)](https://www.npmjs.com/package/geojson-dissolve)


> Dissolve contiguous GeoJSON (Multi)LineStrings and (Multi)Polygons into single units.

## Usage

```js
var dissolve = require('geojson-dissolve')

var line1 = {
  type: 'LineString',
  coordinates: [
    [0.0, 0.0],
    [1.0, 1.0],
    [2.0, 2.0]
  ]
}

var line2 = {
  type: 'LineString',
  coordinates: [
    [2.0, 2.0],
    [3.0, 3.0]
  ]
}

console.log(dissolve([line1, line2]))
```

This will output

```js
{
  type: 'LineString',
  coordinates: [
    [0.0, 0.0],
    [1.0, 1.0],
    [2.0, 2.0],
    [3.0, 3.0]
  ]
}
```

## API

```js
var dissolve = require('geojson-dissolve')
```

### `dissolve([geojson])` or `dissolve(gj1, gj2, ...)`

Consumes a list of homogenous [GeoJSON
objects](https://tools.ietf.org/html/rfc7946#section-3), and returns a single [GeoJSON Geometry Object](https://tools.ietf.org/html/rfc7946#section-3.1), with all touching `LineString`s and `Polygon`s dissolved into single geometries.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install geojson-dissolve
```

## License

ISC

