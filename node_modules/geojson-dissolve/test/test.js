var test = require('tape')
var glob = require('glob')
var fs = require('fs')
var path = require('path')
var hint = require('@mapbox/geojsonhint').hint

var dissolve = require('../')

var REGEN = process.env.GEOJSON_DISSOLVE_REGEN

var pattern = path.join(__dirname, '/fixtures/in/*.geojson')

test('geojson-dissolve', function (t) {
  glob.sync(pattern).forEach(function (input) {
    var geojson = JSON.parse(fs.readFileSync(input))
    var output = dissolve(geojson)
    if (REGEN) {
      var inputErrors = hint(geojson)
      var outputErrors = hint(output)
      if (!inputErrors.length && !outputErrors.length) {
        fs.writeFileSync(input.replace('/in/', '/out/'), JSON.stringify(output, null, 2))
      } else {
        var relativePath = path.relative(__dirname, input)
        inputErrors.forEach(onError.bind(null, relativePath))
        outputErrors.forEach(onError.bind(null, 'generated output for ' + relativePath))
      }
    } else {
      t.deepEqual(output, JSON.parse(fs.readFileSync(input.replace('/in/', '/out/'))), input)
    }
  })
  t.end()

  function onError (filename, e) {
    t.fail('invalid GeoJSON: ' + filename + ' - ' + e.message + ' - ' + (e.level || 'error'))
  }
})
