# simplify-geojson

Apply [Ramer–Douglas–Peucker](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm) line simplification to [GeoJSON](http://www.geojson.org/) features or feature collections in JS or on the CLI.

[![NPM](https://nodei.co/npm/simplify-geojson.png)](https://nodei.co/npm/simplify-geojson/)

This module uses https://github.com/seabre/simplify-geometry for the simplification and wraps it in a interface for easily simplifying GeoJSON.

## Install

```
npm install simplify-geojson
```

## Usage

### CLI

```sh
cat data.geojson | simplify-geojson -t 0.01
```

Tolerance is specified by either `-t` or `--tolerance` and is a number in degrees (e.g. lat/lon distance). 1 degree is roughly equivalent to 69 miles. the default is 0.001, which is around a city block long.

### JS

```js
var simplify = require('simplify-geojson')
var simplified = simplify(geojson, tolerance)
```

`geojson` can be any of the following:

- Feature with a LineString
- Feature with a MultiLineString
- Feature with a Polygon
- Feature with a MultiPolygon
- FeatureCollection with any of the above

All segments in any of the supported types will be simplified (including holes in polygons, for instance).

## Examples

Convert a CSV with lat/lon columns into geojson, then simplify that geojson, then open it in [geojson.io](http://geojson.io/) (CSV is from my GPS logger and was my bike commute this morning):

```sh
npm install simplify-geojson geojsonio-cli csv2geojson -g
curl https://raw.github.com/maxogden/simplify-geojson/master/test-data/oakland-route.csv | \
  csv2geojson --lat "LATITUDE N/S" --lon "LONGITUDE E/W" --line true | \
  simplify-geojson -t 0.001 | \
  geojsonio
```

Simplify alaska's border outline and count the number of lines of the simplified geojson output (tweak `-t` to see how it affects length):

```sh
curl https://rawgit.com/johan/world.geo.json/master/countries/USA/AK.geo.json | \
  simplify-geojson -t 0.01 | \
  wc -l
```

## Contributing

Contributors welcome! Please read the [contributing guidelines](contributing.md) before getting started.

## License

[BSD-2-Clause](https://spdx.org/licenses/BSD-2-Clause.html)
