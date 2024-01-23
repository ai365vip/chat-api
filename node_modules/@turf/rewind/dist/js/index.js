'use strict';

var clone = require('@turf/clone');
var booleanClockwise = require('@turf/boolean-clockwise');
var meta = require('@turf/meta');
var invariant = require('@turf/invariant');
var helpers = require('@turf/helpers');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var clone__default = /*#__PURE__*/_interopDefaultLegacy(clone);
var booleanClockwise__default = /*#__PURE__*/_interopDefaultLegacy(booleanClockwise);

/**
 * Rewind {@link LineString|(Multi)LineString} or {@link Polygon|(Multi)Polygon} outer ring counterclockwise and inner rings clockwise (Uses {@link http://en.wikipedia.org/wiki/Shoelace_formula|Shoelace Formula}).
 *
 * @name rewind
 * @param {GeoJSON} geojson input GeoJSON Polygon
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.reverse=false] enable reverse winding
 * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated (significant performance increase if true)
 * @returns {GeoJSON} rewind Polygon
 * @example
 * var polygon = turf.polygon([[[121, -29], [138, -29], [138, -18], [121, -18], [121, -29]]]);
 *
 * var rewind = turf.rewind(polygon);
 *
 * //addToMap
 * var addToMap = [rewind];
 */
function rewind(geojson, options) {
  // Optional parameters
  options = options || {};
  if (!helpers.isObject(options)) throw new Error("options is invalid");
  var reverse = options.reverse || false;
  var mutate = options.mutate || false;

  // validation
  if (!geojson) throw new Error("<geojson> is required");
  if (typeof reverse !== "boolean")
    throw new Error("<reverse> must be a boolean");
  if (typeof mutate !== "boolean")
    throw new Error("<mutate> must be a boolean");

  // prevent input mutation
  if (mutate === false) geojson = clone__default['default'](geojson);

  // Support Feature Collection or Geometry Collection
  var results = [];
  switch (geojson.type) {
    case "GeometryCollection":
      meta.geomEach(geojson, function (geometry) {
        rewindFeature(geometry, reverse);
      });
      return geojson;
    case "FeatureCollection":
      meta.featureEach(geojson, function (feature) {
        meta.featureEach(rewindFeature(feature, reverse), function (result) {
          results.push(result);
        });
      });
      return helpers.featureCollection(results);
  }
  // Support Feature or Geometry Objects
  return rewindFeature(geojson, reverse);
}

/**
 * Rewind
 *
 * @private
 * @param {Geometry|Feature<any>} geojson Geometry or Feature
 * @param {Boolean} [reverse=false] enable reverse winding
 * @returns {Geometry|Feature<any>} rewind Geometry or Feature
 */
function rewindFeature(geojson, reverse) {
  var type = geojson.type === "Feature" ? geojson.geometry.type : geojson.type;

  // Support all GeoJSON Geometry Objects
  switch (type) {
    case "GeometryCollection":
      meta.geomEach(geojson, function (geometry) {
        rewindFeature(geometry, reverse);
      });
      return geojson;
    case "LineString":
      rewindLineString(invariant.getCoords(geojson), reverse);
      return geojson;
    case "Polygon":
      rewindPolygon(invariant.getCoords(geojson), reverse);
      return geojson;
    case "MultiLineString":
      invariant.getCoords(geojson).forEach(function (lineCoords) {
        rewindLineString(lineCoords, reverse);
      });
      return geojson;
    case "MultiPolygon":
      invariant.getCoords(geojson).forEach(function (lineCoords) {
        rewindPolygon(lineCoords, reverse);
      });
      return geojson;
    case "Point":
    case "MultiPoint":
      return geojson;
  }
}

/**
 * Rewind LineString - outer ring clockwise
 *
 * @private
 * @param {Array<Array<number>>} coords GeoJSON LineString geometry coordinates
 * @param {Boolean} [reverse=false] enable reverse winding
 * @returns {void} mutates coordinates
 */
function rewindLineString(coords, reverse) {
  if (booleanClockwise__default['default'](coords) === reverse) coords.reverse();
}

/**
 * Rewind Polygon - outer ring counterclockwise and inner rings clockwise.
 *
 * @private
 * @param {Array<Array<Array<number>>>} coords GeoJSON Polygon geometry coordinates
 * @param {Boolean} [reverse=false] enable reverse winding
 * @returns {void} mutates coordinates
 */
function rewindPolygon(coords, reverse) {
  // outer ring
  if (booleanClockwise__default['default'](coords[0]) !== reverse) {
    coords[0].reverse();
  }
  // inner rings
  for (var i = 1; i < coords.length; i++) {
    if (booleanClockwise__default['default'](coords[i]) === reverse) {
      coords[i].reverse();
    }
  }
}

module.exports = rewind;
module.exports.default = rewind;
