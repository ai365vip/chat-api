# geojson-linestring-dissolve

> Dissolve connected GeoJSON LineStrings into a single LineString.

## Usage

```js
var dissolve = require('geojson-linestring-dissolve')

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

outputs

```
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
var dissolve = require('geojson-linestring-dissolve')
```

### dissolve([lineStrings])

Consumes an array of [GeoJSON](http://geojson.org/geojson-spec.html)
`LineString`s, and returns a new GeoJSON `LineString` object, with all touching
`LineString`s dissolved into a single unit. If the `LineString`s are
non-contiguous, a `MultiLineString` is returned.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install geojson-linestring-dissolve
```

## License

ISC

