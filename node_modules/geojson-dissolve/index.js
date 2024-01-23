var createTopology = require('topojson-server').topology
var mergeTopology = require('topojson-client').merge
var dissolveLineStrings = require('geojson-linestring-dissolve')
var geomEach = require('@turf/meta').geomEach
var flatten = require('geojson-flatten')

module.exports = dissolve

function toArray (args) {
  if (!args.length) return []
  return Array.isArray(args[0]) ? args[0] : Array.prototype.slice.call(args)
}

function dissolvePolygons (geoms) {
  // Topojson modifies in place, so we need to deep clone first
  var objects = {
    geoms: {
      type: 'GeometryCollection',
      geometries: JSON.parse(JSON.stringify(geoms))
    }
  }
  var topo = createTopology(objects)
  return mergeTopology(topo, topo.objects.geoms.geometries)
}

// [GeoJSON] -> String|Null
function getHomogenousType (geoms) {
  var type = null
  for (var i = 0; i < geoms.length; i++) {
    if (!type) {
      type = geoms[i].type
    } else if (type !== geoms[i].type) {
      return null
    }
  }
  return type
}

// Transform function: attempts to dissolve geojson objects where possible
// [GeoJSON] -> GeoJSON geometry
function dissolve () {
  // accept an array of geojson objects, or an argument list
  var objects = toArray(arguments)
  var geoms = objects.reduce(function (acc, o) {
    // flatten any Multi-geom into features of simple types
    var flat = flatten(o)
    if (!Array.isArray(flat)) flat = [flat]
    for (var i = 0; i < flat.length; i++) {
      // get an array of all flatten geometry objects
      geomEach(flat[i], function (geom) {
        acc.push(geom)
      })
    }
    return acc
  }, [])
  // Assert homogenity
  var type = getHomogenousType(geoms)
  if (!type) {
    throw new Error('List does not contain only homoegenous GeoJSON')
  }

  switch (type) {
    case 'LineString':
      return dissolveLineStrings(geoms)
    case 'Polygon':
      return dissolvePolygons(geoms)
    default:
      return geoms
  }
}

