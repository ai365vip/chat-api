var dissolve = require('./')
var Benchmark = require('benchmark')
var fs = require('fs')
var path = require('path')

var fixtureFilename = path.join(__dirname, '/test/fixtures/in/river-polygon.geojson')
var fc = JSON.parse(fs.readFileSync(fixtureFilename))
var geoms = fc.features.map(f => f.geometry)

var suite = new Benchmark.Suite('geojson-dissolve')
suite
  .add('geojson-dissolve', function () {
    dissolve(geoms)
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
  })
  .run()
