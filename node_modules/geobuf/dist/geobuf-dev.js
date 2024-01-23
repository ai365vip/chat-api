(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.geobuf = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

module.exports = decode;

var keys, values, lengths, dim, e;

var geometryTypes = [
    'Point', 'MultiPoint', 'LineString', 'MultiLineString',
    'Polygon', 'MultiPolygon', 'GeometryCollection'];

function decode(pbf) {
    dim = 2;
    e = Math.pow(10, 6);
    lengths = null;

    keys = [];
    values = [];
    var obj = pbf.readFields(readDataField, {});
    keys = null;

    return obj;
}

function readDataField(tag, obj, pbf) {
    if (tag === 1) keys.push(pbf.readString());
    else if (tag === 2) dim = pbf.readVarint();
    else if (tag === 3) e = Math.pow(10, pbf.readVarint());

    else if (tag === 4) readFeatureCollection(pbf, obj);
    else if (tag === 5) readFeature(pbf, obj);
    else if (tag === 6) readGeometry(pbf, obj);
}

function readFeatureCollection(pbf, obj) {
    obj.type = 'FeatureCollection';
    obj.features = [];
    return pbf.readMessage(readFeatureCollectionField, obj);
}

function readFeature(pbf, feature) {
    feature.type = 'Feature';
    var f = pbf.readMessage(readFeatureField, feature);
    if (!('geometry' in f)) f.geometry = null;
    return f;
}

function readGeometry(pbf, geom) {
    geom.type = 'Point';
    return pbf.readMessage(readGeometryField, geom);
}

function readFeatureCollectionField(tag, obj, pbf) {
    if (tag === 1) obj.features.push(readFeature(pbf, {}));

    else if (tag === 13) values.push(readValue(pbf));
    else if (tag === 15) readProps(pbf, obj);
}

function readFeatureField(tag, feature, pbf) {
    if (tag === 1) feature.geometry = readGeometry(pbf, {});

    else if (tag === 11) feature.id = pbf.readString();
    else if (tag === 12) feature.id = pbf.readSVarint();

    else if (tag === 13) values.push(readValue(pbf));
    else if (tag === 14) feature.properties = readProps(pbf, {});
    else if (tag === 15) readProps(pbf, feature);
}

function readGeometryField(tag, geom, pbf) {
    if (tag === 1) geom.type = geometryTypes[pbf.readVarint()];

    else if (tag === 2) lengths = pbf.readPackedVarint();
    else if (tag === 3) readCoords(geom, pbf, geom.type);
    else if (tag === 4) {
        geom.geometries = geom.geometries || [];
        geom.geometries.push(readGeometry(pbf, {}));
    }
    else if (tag === 13) values.push(readValue(pbf));
    else if (tag === 15) readProps(pbf, geom);
}

function readCoords(geom, pbf, type) {
    if (type === 'Point') geom.coordinates = readPoint(pbf);
    else if (type === 'MultiPoint') geom.coordinates = readLine(pbf, true);
    else if (type === 'LineString') geom.coordinates = readLine(pbf);
    else if (type === 'MultiLineString') geom.coordinates = readMultiLine(pbf);
    else if (type === 'Polygon') geom.coordinates = readMultiLine(pbf, true);
    else if (type === 'MultiPolygon') geom.coordinates = readMultiPolygon(pbf);
}

function readValue(pbf) {
    var end = pbf.readVarint() + pbf.pos,
        value = null;

    while (pbf.pos < end) {
        var val = pbf.readVarint(),
            tag = val >> 3;

        if (tag === 1) value = pbf.readString();
        else if (tag === 2) value = pbf.readDouble();
        else if (tag === 3) value = pbf.readVarint();
        else if (tag === 4) value = -pbf.readVarint();
        else if (tag === 5) value = pbf.readBoolean();
        else if (tag === 6) value = JSON.parse(pbf.readString());
    }
    return value;
}

function readProps(pbf, props) {
    var end = pbf.readVarint() + pbf.pos;
    while (pbf.pos < end) props[keys[pbf.readVarint()]] = values[pbf.readVarint()];
    values = [];
    return props;
}

function readPoint(pbf) {
    var end = pbf.readVarint() + pbf.pos,
        coords = [];
    while (pbf.pos < end) coords.push(pbf.readSVarint() / e);
    return coords;
}

function readLinePart(pbf, end, len, closed) {
    var i = 0,
        coords = [],
        p, d;

    var prevP = [];
    for (d = 0; d < dim; d++) prevP[d] = 0;

    while (len ? i < len : pbf.pos < end) {
        p = [];
        for (d = 0; d < dim; d++) {
            prevP[d] += pbf.readSVarint();
            p[d] = prevP[d] / e;
        }
        coords.push(p);
        i++;
    }
    if (closed) coords.push(coords[0]);

    return coords;
}

function readLine(pbf) {
    return readLinePart(pbf, pbf.readVarint() + pbf.pos);
}

function readMultiLine(pbf, closed) {
    var end = pbf.readVarint() + pbf.pos;
    if (!lengths) return [readLinePart(pbf, end, null, closed)];

    var coords = [];
    for (var i = 0; i < lengths.length; i++) coords.push(readLinePart(pbf, end, lengths[i], closed));
    lengths = null;
    return coords;
}

function readMultiPolygon(pbf) {
    var end = pbf.readVarint() + pbf.pos;
    if (!lengths) return [[readLinePart(pbf, end, null, true)]];

    var coords = [];
    var j = 1;
    for (var i = 0; i < lengths[0]; i++) {
        var rings = [];
        for (var k = 0; k < lengths[j]; k++) rings.push(readLinePart(pbf, end, lengths[j + 1 + k], true));
        j += lengths[j] + 1;
        coords.push(rings);
    }
    lengths = null;
    return coords;
}

},{}],2:[function(require,module,exports){
'use strict';

module.exports = encode;

var keys, keysNum, keysArr, dim, e,
    maxPrecision = 1e6;

var geometryTypes = {
    'Point': 0,
    'MultiPoint': 1,
    'LineString': 2,
    'MultiLineString': 3,
    'Polygon': 4,
    'MultiPolygon': 5,
    'GeometryCollection': 6
};

function encode(obj, pbf) {
    keys = {};
    keysArr = [];
    keysNum = 0;
    dim = 0;
    e = 1;

    analyze(obj);

    e = Math.min(e, maxPrecision);
    var precision = Math.ceil(Math.log(e) / Math.LN10);

    for (var i = 0; i < keysArr.length; i++) pbf.writeStringField(1, keysArr[i]);
    if (dim !== 2) pbf.writeVarintField(2, dim);
    if (precision !== 6) pbf.writeVarintField(3, precision);

    if (obj.type === 'FeatureCollection') pbf.writeMessage(4, writeFeatureCollection, obj);
    else if (obj.type === 'Feature') pbf.writeMessage(5, writeFeature, obj);
    else pbf.writeMessage(6, writeGeometry, obj);

    keys = null;

    return pbf.finish();
}

function analyze(obj) {
    var i, key;

    if (obj.type === 'FeatureCollection') {
        for (i = 0; i < obj.features.length; i++) analyze(obj.features[i]);

    } else if (obj.type === 'Feature') {
        if (obj.geometry !== null) analyze(obj.geometry);
        for (key in obj.properties) saveKey(key);

    } else if (obj.type === 'Point') analyzePoint(obj.coordinates);
    else if (obj.type === 'MultiPoint') analyzePoints(obj.coordinates);
    else if (obj.type === 'GeometryCollection') {
        for (i = 0; i < obj.geometries.length; i++) analyze(obj.geometries[i]);
    }
    else if (obj.type === 'LineString') analyzePoints(obj.coordinates);
    else if (obj.type === 'Polygon' || obj.type === 'MultiLineString') analyzeMultiLine(obj.coordinates);
    else if (obj.type === 'MultiPolygon') {
        for (i = 0; i < obj.coordinates.length; i++) analyzeMultiLine(obj.coordinates[i]);
    }

    for (key in obj) {
        if (!isSpecialKey(key, obj.type)) saveKey(key);
    }
}

function analyzeMultiLine(coords) {
    for (var i = 0; i < coords.length; i++) analyzePoints(coords[i]);
}

function analyzePoints(coords) {
    for (var i = 0; i < coords.length; i++) analyzePoint(coords[i]);
}

function analyzePoint(point) {
    dim = Math.max(dim, point.length);

    // find max precision
    for (var i = 0; i < point.length; i++) {
        while (Math.round(point[i] * e) / e !== point[i] && e < maxPrecision) e *= 10;
    }
}

function saveKey(key) {
    if (keys[key] === undefined) {
        keysArr.push(key);
        keys[key] = keysNum++;
    }
}

function writeFeatureCollection(obj, pbf) {
    for (var i = 0; i < obj.features.length; i++) {
        pbf.writeMessage(1, writeFeature, obj.features[i]);
    }
    writeProps(obj, pbf, true);
}

function writeFeature(feature, pbf) {
    if (feature.geometry !== null) pbf.writeMessage(1, writeGeometry, feature.geometry);

    if (feature.id !== undefined) {
        if (typeof feature.id === 'number' && feature.id % 1 === 0) pbf.writeSVarintField(12, feature.id);
        else pbf.writeStringField(11, feature.id);
    }

    if (feature.properties) writeProps(feature.properties, pbf);
    writeProps(feature, pbf, true);
}

function writeGeometry(geom, pbf) {
    pbf.writeVarintField(1, geometryTypes[geom.type]);

    var coords = geom.coordinates;

    if (geom.type === 'Point') writePoint(coords, pbf);
    else if (geom.type === 'MultiPoint') writeLine(coords, pbf, true);
    else if (geom.type === 'LineString') writeLine(coords, pbf);
    else if (geom.type === 'MultiLineString') writeMultiLine(coords, pbf);
    else if (geom.type === 'Polygon') writeMultiLine(coords, pbf, true);
    else if (geom.type === 'MultiPolygon') writeMultiPolygon(coords, pbf);
    else if (geom.type === 'GeometryCollection') {
        for (var i = 0; i < geom.geometries.length; i++) pbf.writeMessage(4, writeGeometry, geom.geometries[i]);
    }

    writeProps(geom, pbf, true);
}

function writeProps(props, pbf, isCustom) {
    var indexes = [],
        valueIndex = 0;

    for (var key in props) {
        if (isCustom && isSpecialKey(key, props.type)) {
            continue;
        }
        pbf.writeMessage(13, writeValue, props[key]);
        indexes.push(keys[key]);
        indexes.push(valueIndex++);
    }
    pbf.writePackedVarint(isCustom ? 15 : 14, indexes);
}

function writeValue(value, pbf) {
    if (value === null) return;

    var type = typeof value;

    if (type === 'string') pbf.writeStringField(1, value);
    else if (type === 'boolean') pbf.writeBooleanField(5, value);
    else if (type === 'object') pbf.writeStringField(6, JSON.stringify(value));
    else if (type === 'number') {
        if (value % 1 !== 0) pbf.writeDoubleField(2, value);
        else if (value >= 0) pbf.writeVarintField(3, value);
        else pbf.writeVarintField(4, -value);
    }
}

function writePoint(point, pbf) {
    var coords = [];
    for (var i = 0; i < dim; i++) coords.push(Math.round(point[i] * e));
    pbf.writePackedSVarint(3, coords);
}

function writeLine(line, pbf) {
    var coords = [];
    populateLine(coords, line);
    pbf.writePackedSVarint(3, coords);
}

function writeMultiLine(lines, pbf, closed) {
    var len = lines.length,
        i;
    if (len !== 1) {
        var lengths = [];
        for (i = 0; i < len; i++) lengths.push(lines[i].length - (closed ? 1 : 0));
        pbf.writePackedVarint(2, lengths);
        // TODO faster with custom writeMessage?
    }
    var coords = [];
    for (i = 0; i < len; i++) populateLine(coords, lines[i], closed);
    pbf.writePackedSVarint(3, coords);
}

function writeMultiPolygon(polygons, pbf) {
    var len = polygons.length,
        i, j;
    if (len !== 1 || polygons[0].length !== 1) {
        var lengths = [len];
        for (i = 0; i < len; i++) {
            lengths.push(polygons[i].length);
            for (j = 0; j < polygons[i].length; j++) lengths.push(polygons[i][j].length - 1);
        }
        pbf.writePackedVarint(2, lengths);
    }

    var coords = [];
    for (i = 0; i < len; i++) {
        for (j = 0; j < polygons[i].length; j++) populateLine(coords, polygons[i][j], true);
    }
    pbf.writePackedSVarint(3, coords);
}

function populateLine(coords, line, closed) {
    var i, j,
        len = line.length - (closed ? 1 : 0),
        sum = new Array(dim);
    for (j = 0; j < dim; j++) sum[j] = 0;
    for (i = 0; i < len; i++) {
        for (j = 0; j < dim; j++) {
            var n = Math.round(line[i][j] * e) - sum[j];
            coords.push(n);
            sum[j] += n;
        }
    }
}

function isSpecialKey(key, type) {
    if (key === 'type') return true;
    else if (type === 'FeatureCollection') {
        if (key === 'features') return true;
    } else if (type === 'Feature') {
        if (key === 'id' || key === 'properties' || key === 'geometry') return true;
    } else if (type === 'GeometryCollection') {
        if (key === 'geometries') return true;
    } else if (key === 'coordinates') return true;
    return false;
}

},{}],3:[function(require,module,exports){
'use strict';

exports.encode = require('./encode');
exports.decode = require('./decode');

},{"./decode":1,"./encode":2}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZWNvZGUuanMiLCJlbmNvZGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlY29kZTtcblxudmFyIGtleXMsIHZhbHVlcywgbGVuZ3RocywgZGltLCBlO1xuXG52YXIgZ2VvbWV0cnlUeXBlcyA9IFtcbiAgICAnUG9pbnQnLCAnTXVsdGlQb2ludCcsICdMaW5lU3RyaW5nJywgJ011bHRpTGluZVN0cmluZycsXG4gICAgJ1BvbHlnb24nLCAnTXVsdGlQb2x5Z29uJywgJ0dlb21ldHJ5Q29sbGVjdGlvbiddO1xuXG5mdW5jdGlvbiBkZWNvZGUocGJmKSB7XG4gICAgZGltID0gMjtcbiAgICBlID0gTWF0aC5wb3coMTAsIDYpO1xuICAgIGxlbmd0aHMgPSBudWxsO1xuXG4gICAga2V5cyA9IFtdO1xuICAgIHZhbHVlcyA9IFtdO1xuICAgIHZhciBvYmogPSBwYmYucmVhZEZpZWxkcyhyZWFkRGF0YUZpZWxkLCB7fSk7XG4gICAga2V5cyA9IG51bGw7XG5cbiAgICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiByZWFkRGF0YUZpZWxkKHRhZywgb2JqLCBwYmYpIHtcbiAgICBpZiAodGFnID09PSAxKSBrZXlzLnB1c2gocGJmLnJlYWRTdHJpbmcoKSk7XG4gICAgZWxzZSBpZiAodGFnID09PSAyKSBkaW0gPSBwYmYucmVhZFZhcmludCgpO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gMykgZSA9IE1hdGgucG93KDEwLCBwYmYucmVhZFZhcmludCgpKTtcblxuICAgIGVsc2UgaWYgKHRhZyA9PT0gNCkgcmVhZEZlYXR1cmVDb2xsZWN0aW9uKHBiZiwgb2JqKTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDUpIHJlYWRGZWF0dXJlKHBiZiwgb2JqKTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDYpIHJlYWRHZW9tZXRyeShwYmYsIG9iaik7XG59XG5cbmZ1bmN0aW9uIHJlYWRGZWF0dXJlQ29sbGVjdGlvbihwYmYsIG9iaikge1xuICAgIG9iai50eXBlID0gJ0ZlYXR1cmVDb2xsZWN0aW9uJztcbiAgICBvYmouZmVhdHVyZXMgPSBbXTtcbiAgICByZXR1cm4gcGJmLnJlYWRNZXNzYWdlKHJlYWRGZWF0dXJlQ29sbGVjdGlvbkZpZWxkLCBvYmopO1xufVxuXG5mdW5jdGlvbiByZWFkRmVhdHVyZShwYmYsIGZlYXR1cmUpIHtcbiAgICBmZWF0dXJlLnR5cGUgPSAnRmVhdHVyZSc7XG4gICAgdmFyIGYgPSBwYmYucmVhZE1lc3NhZ2UocmVhZEZlYXR1cmVGaWVsZCwgZmVhdHVyZSk7XG4gICAgaWYgKCEoJ2dlb21ldHJ5JyBpbiBmKSkgZi5nZW9tZXRyeSA9IG51bGw7XG4gICAgcmV0dXJuIGY7XG59XG5cbmZ1bmN0aW9uIHJlYWRHZW9tZXRyeShwYmYsIGdlb20pIHtcbiAgICBnZW9tLnR5cGUgPSAnUG9pbnQnO1xuICAgIHJldHVybiBwYmYucmVhZE1lc3NhZ2UocmVhZEdlb21ldHJ5RmllbGQsIGdlb20pO1xufVxuXG5mdW5jdGlvbiByZWFkRmVhdHVyZUNvbGxlY3Rpb25GaWVsZCh0YWcsIG9iaiwgcGJmKSB7XG4gICAgaWYgKHRhZyA9PT0gMSkgb2JqLmZlYXR1cmVzLnB1c2gocmVhZEZlYXR1cmUocGJmLCB7fSkpO1xuXG4gICAgZWxzZSBpZiAodGFnID09PSAxMykgdmFsdWVzLnB1c2gocmVhZFZhbHVlKHBiZikpO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gMTUpIHJlYWRQcm9wcyhwYmYsIG9iaik7XG59XG5cbmZ1bmN0aW9uIHJlYWRGZWF0dXJlRmllbGQodGFnLCBmZWF0dXJlLCBwYmYpIHtcbiAgICBpZiAodGFnID09PSAxKSBmZWF0dXJlLmdlb21ldHJ5ID0gcmVhZEdlb21ldHJ5KHBiZiwge30pO1xuXG4gICAgZWxzZSBpZiAodGFnID09PSAxMSkgZmVhdHVyZS5pZCA9IHBiZi5yZWFkU3RyaW5nKCk7XG4gICAgZWxzZSBpZiAodGFnID09PSAxMikgZmVhdHVyZS5pZCA9IHBiZi5yZWFkU1ZhcmludCgpO1xuXG4gICAgZWxzZSBpZiAodGFnID09PSAxMykgdmFsdWVzLnB1c2gocmVhZFZhbHVlKHBiZikpO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gMTQpIGZlYXR1cmUucHJvcGVydGllcyA9IHJlYWRQcm9wcyhwYmYsIHt9KTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDE1KSByZWFkUHJvcHMocGJmLCBmZWF0dXJlKTtcbn1cblxuZnVuY3Rpb24gcmVhZEdlb21ldHJ5RmllbGQodGFnLCBnZW9tLCBwYmYpIHtcbiAgICBpZiAodGFnID09PSAxKSBnZW9tLnR5cGUgPSBnZW9tZXRyeVR5cGVzW3BiZi5yZWFkVmFyaW50KCldO1xuXG4gICAgZWxzZSBpZiAodGFnID09PSAyKSBsZW5ndGhzID0gcGJmLnJlYWRQYWNrZWRWYXJpbnQoKTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDMpIHJlYWRDb29yZHMoZ2VvbSwgcGJmLCBnZW9tLnR5cGUpO1xuICAgIGVsc2UgaWYgKHRhZyA9PT0gNCkge1xuICAgICAgICBnZW9tLmdlb21ldHJpZXMgPSBnZW9tLmdlb21ldHJpZXMgfHwgW107XG4gICAgICAgIGdlb20uZ2VvbWV0cmllcy5wdXNoKHJlYWRHZW9tZXRyeShwYmYsIHt9KSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRhZyA9PT0gMTMpIHZhbHVlcy5wdXNoKHJlYWRWYWx1ZShwYmYpKTtcbiAgICBlbHNlIGlmICh0YWcgPT09IDE1KSByZWFkUHJvcHMocGJmLCBnZW9tKTtcbn1cblxuZnVuY3Rpb24gcmVhZENvb3JkcyhnZW9tLCBwYmYsIHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PT0gJ1BvaW50JykgZ2VvbS5jb29yZGluYXRlcyA9IHJlYWRQb2ludChwYmYpO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdNdWx0aVBvaW50JykgZ2VvbS5jb29yZGluYXRlcyA9IHJlYWRMaW5lKHBiZiwgdHJ1ZSk7XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ0xpbmVTdHJpbmcnKSBnZW9tLmNvb3JkaW5hdGVzID0gcmVhZExpbmUocGJmKTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnTXVsdGlMaW5lU3RyaW5nJykgZ2VvbS5jb29yZGluYXRlcyA9IHJlYWRNdWx0aUxpbmUocGJmKTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnUG9seWdvbicpIGdlb20uY29vcmRpbmF0ZXMgPSByZWFkTXVsdGlMaW5lKHBiZiwgdHJ1ZSk7XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ011bHRpUG9seWdvbicpIGdlb20uY29vcmRpbmF0ZXMgPSByZWFkTXVsdGlQb2x5Z29uKHBiZik7XG59XG5cbmZ1bmN0aW9uIHJlYWRWYWx1ZShwYmYpIHtcbiAgICB2YXIgZW5kID0gcGJmLnJlYWRWYXJpbnQoKSArIHBiZi5wb3MsXG4gICAgICAgIHZhbHVlID0gbnVsbDtcblxuICAgIHdoaWxlIChwYmYucG9zIDwgZW5kKSB7XG4gICAgICAgIHZhciB2YWwgPSBwYmYucmVhZFZhcmludCgpLFxuICAgICAgICAgICAgdGFnID0gdmFsID4+IDM7XG5cbiAgICAgICAgaWYgKHRhZyA9PT0gMSkgdmFsdWUgPSBwYmYucmVhZFN0cmluZygpO1xuICAgICAgICBlbHNlIGlmICh0YWcgPT09IDIpIHZhbHVlID0gcGJmLnJlYWREb3VibGUoKTtcbiAgICAgICAgZWxzZSBpZiAodGFnID09PSAzKSB2YWx1ZSA9IHBiZi5yZWFkVmFyaW50KCk7XG4gICAgICAgIGVsc2UgaWYgKHRhZyA9PT0gNCkgdmFsdWUgPSAtcGJmLnJlYWRWYXJpbnQoKTtcbiAgICAgICAgZWxzZSBpZiAodGFnID09PSA1KSB2YWx1ZSA9IHBiZi5yZWFkQm9vbGVhbigpO1xuICAgICAgICBlbHNlIGlmICh0YWcgPT09IDYpIHZhbHVlID0gSlNPTi5wYXJzZShwYmYucmVhZFN0cmluZygpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiByZWFkUHJvcHMocGJmLCBwcm9wcykge1xuICAgIHZhciBlbmQgPSBwYmYucmVhZFZhcmludCgpICsgcGJmLnBvcztcbiAgICB3aGlsZSAocGJmLnBvcyA8IGVuZCkgcHJvcHNba2V5c1twYmYucmVhZFZhcmludCgpXV0gPSB2YWx1ZXNbcGJmLnJlYWRWYXJpbnQoKV07XG4gICAgdmFsdWVzID0gW107XG4gICAgcmV0dXJuIHByb3BzO1xufVxuXG5mdW5jdGlvbiByZWFkUG9pbnQocGJmKSB7XG4gICAgdmFyIGVuZCA9IHBiZi5yZWFkVmFyaW50KCkgKyBwYmYucG9zLFxuICAgICAgICBjb29yZHMgPSBbXTtcbiAgICB3aGlsZSAocGJmLnBvcyA8IGVuZCkgY29vcmRzLnB1c2gocGJmLnJlYWRTVmFyaW50KCkgLyBlKTtcbiAgICByZXR1cm4gY29vcmRzO1xufVxuXG5mdW5jdGlvbiByZWFkTGluZVBhcnQocGJmLCBlbmQsIGxlbiwgY2xvc2VkKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBjb29yZHMgPSBbXSxcbiAgICAgICAgcCwgZDtcblxuICAgIHZhciBwcmV2UCA9IFtdO1xuICAgIGZvciAoZCA9IDA7IGQgPCBkaW07IGQrKykgcHJldlBbZF0gPSAwO1xuXG4gICAgd2hpbGUgKGxlbiA/IGkgPCBsZW4gOiBwYmYucG9zIDwgZW5kKSB7XG4gICAgICAgIHAgPSBbXTtcbiAgICAgICAgZm9yIChkID0gMDsgZCA8IGRpbTsgZCsrKSB7XG4gICAgICAgICAgICBwcmV2UFtkXSArPSBwYmYucmVhZFNWYXJpbnQoKTtcbiAgICAgICAgICAgIHBbZF0gPSBwcmV2UFtkXSAvIGU7XG4gICAgICAgIH1cbiAgICAgICAgY29vcmRzLnB1c2gocCk7XG4gICAgICAgIGkrKztcbiAgICB9XG4gICAgaWYgKGNsb3NlZCkgY29vcmRzLnB1c2goY29vcmRzWzBdKTtcblxuICAgIHJldHVybiBjb29yZHM7XG59XG5cbmZ1bmN0aW9uIHJlYWRMaW5lKHBiZikge1xuICAgIHJldHVybiByZWFkTGluZVBhcnQocGJmLCBwYmYucmVhZFZhcmludCgpICsgcGJmLnBvcyk7XG59XG5cbmZ1bmN0aW9uIHJlYWRNdWx0aUxpbmUocGJmLCBjbG9zZWQpIHtcbiAgICB2YXIgZW5kID0gcGJmLnJlYWRWYXJpbnQoKSArIHBiZi5wb3M7XG4gICAgaWYgKCFsZW5ndGhzKSByZXR1cm4gW3JlYWRMaW5lUGFydChwYmYsIGVuZCwgbnVsbCwgY2xvc2VkKV07XG5cbiAgICB2YXIgY29vcmRzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGhzLmxlbmd0aDsgaSsrKSBjb29yZHMucHVzaChyZWFkTGluZVBhcnQocGJmLCBlbmQsIGxlbmd0aHNbaV0sIGNsb3NlZCkpO1xuICAgIGxlbmd0aHMgPSBudWxsO1xuICAgIHJldHVybiBjb29yZHM7XG59XG5cbmZ1bmN0aW9uIHJlYWRNdWx0aVBvbHlnb24ocGJmKSB7XG4gICAgdmFyIGVuZCA9IHBiZi5yZWFkVmFyaW50KCkgKyBwYmYucG9zO1xuICAgIGlmICghbGVuZ3RocykgcmV0dXJuIFtbcmVhZExpbmVQYXJ0KHBiZiwgZW5kLCBudWxsLCB0cnVlKV1dO1xuXG4gICAgdmFyIGNvb3JkcyA9IFtdO1xuICAgIHZhciBqID0gMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aHNbMF07IGkrKykge1xuICAgICAgICB2YXIgcmluZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBsZW5ndGhzW2pdOyBrKyspIHJpbmdzLnB1c2gocmVhZExpbmVQYXJ0KHBiZiwgZW5kLCBsZW5ndGhzW2ogKyAxICsga10sIHRydWUpKTtcbiAgICAgICAgaiArPSBsZW5ndGhzW2pdICsgMTtcbiAgICAgICAgY29vcmRzLnB1c2gocmluZ3MpO1xuICAgIH1cbiAgICBsZW5ndGhzID0gbnVsbDtcbiAgICByZXR1cm4gY29vcmRzO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVuY29kZTtcblxudmFyIGtleXMsIGtleXNOdW0sIGtleXNBcnIsIGRpbSwgZSxcbiAgICBtYXhQcmVjaXNpb24gPSAxZTY7XG5cbnZhciBnZW9tZXRyeVR5cGVzID0ge1xuICAgICdQb2ludCc6IDAsXG4gICAgJ011bHRpUG9pbnQnOiAxLFxuICAgICdMaW5lU3RyaW5nJzogMixcbiAgICAnTXVsdGlMaW5lU3RyaW5nJzogMyxcbiAgICAnUG9seWdvbic6IDQsXG4gICAgJ011bHRpUG9seWdvbic6IDUsXG4gICAgJ0dlb21ldHJ5Q29sbGVjdGlvbic6IDZcbn07XG5cbmZ1bmN0aW9uIGVuY29kZShvYmosIHBiZikge1xuICAgIGtleXMgPSB7fTtcbiAgICBrZXlzQXJyID0gW107XG4gICAga2V5c051bSA9IDA7XG4gICAgZGltID0gMDtcbiAgICBlID0gMTtcblxuICAgIGFuYWx5emUob2JqKTtcblxuICAgIGUgPSBNYXRoLm1pbihlLCBtYXhQcmVjaXNpb24pO1xuICAgIHZhciBwcmVjaXNpb24gPSBNYXRoLmNlaWwoTWF0aC5sb2coZSkgLyBNYXRoLkxOMTApO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzQXJyLmxlbmd0aDsgaSsrKSBwYmYud3JpdGVTdHJpbmdGaWVsZCgxLCBrZXlzQXJyW2ldKTtcbiAgICBpZiAoZGltICE9PSAyKSBwYmYud3JpdGVWYXJpbnRGaWVsZCgyLCBkaW0pO1xuICAgIGlmIChwcmVjaXNpb24gIT09IDYpIHBiZi53cml0ZVZhcmludEZpZWxkKDMsIHByZWNpc2lvbik7XG5cbiAgICBpZiAob2JqLnR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicpIHBiZi53cml0ZU1lc3NhZ2UoNCwgd3JpdGVGZWF0dXJlQ29sbGVjdGlvbiwgb2JqKTtcbiAgICBlbHNlIGlmIChvYmoudHlwZSA9PT0gJ0ZlYXR1cmUnKSBwYmYud3JpdGVNZXNzYWdlKDUsIHdyaXRlRmVhdHVyZSwgb2JqKTtcbiAgICBlbHNlIHBiZi53cml0ZU1lc3NhZ2UoNiwgd3JpdGVHZW9tZXRyeSwgb2JqKTtcblxuICAgIGtleXMgPSBudWxsO1xuXG4gICAgcmV0dXJuIHBiZi5maW5pc2goKTtcbn1cblxuZnVuY3Rpb24gYW5hbHl6ZShvYmopIHtcbiAgICB2YXIgaSwga2V5O1xuXG4gICAgaWYgKG9iai50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBvYmouZmVhdHVyZXMubGVuZ3RoOyBpKyspIGFuYWx5emUob2JqLmZlYXR1cmVzW2ldKTtcblxuICAgIH0gZWxzZSBpZiAob2JqLnR5cGUgPT09ICdGZWF0dXJlJykge1xuICAgICAgICBpZiAob2JqLmdlb21ldHJ5ICE9PSBudWxsKSBhbmFseXplKG9iai5nZW9tZXRyeSk7XG4gICAgICAgIGZvciAoa2V5IGluIG9iai5wcm9wZXJ0aWVzKSBzYXZlS2V5KGtleSk7XG5cbiAgICB9IGVsc2UgaWYgKG9iai50eXBlID09PSAnUG9pbnQnKSBhbmFseXplUG9pbnQob2JqLmNvb3JkaW5hdGVzKTtcbiAgICBlbHNlIGlmIChvYmoudHlwZSA9PT0gJ011bHRpUG9pbnQnKSBhbmFseXplUG9pbnRzKG9iai5jb29yZGluYXRlcyk7XG4gICAgZWxzZSBpZiAob2JqLnR5cGUgPT09ICdHZW9tZXRyeUNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBvYmouZ2VvbWV0cmllcy5sZW5ndGg7IGkrKykgYW5hbHl6ZShvYmouZ2VvbWV0cmllc1tpXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG9iai50eXBlID09PSAnTGluZVN0cmluZycpIGFuYWx5emVQb2ludHMob2JqLmNvb3JkaW5hdGVzKTtcbiAgICBlbHNlIGlmIChvYmoudHlwZSA9PT0gJ1BvbHlnb24nIHx8IG9iai50eXBlID09PSAnTXVsdGlMaW5lU3RyaW5nJykgYW5hbHl6ZU11bHRpTGluZShvYmouY29vcmRpbmF0ZXMpO1xuICAgIGVsc2UgaWYgKG9iai50eXBlID09PSAnTXVsdGlQb2x5Z29uJykge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgb2JqLmNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrKSBhbmFseXplTXVsdGlMaW5lKG9iai5jb29yZGluYXRlc1tpXSk7XG4gICAgfVxuXG4gICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmICghaXNTcGVjaWFsS2V5KGtleSwgb2JqLnR5cGUpKSBzYXZlS2V5KGtleSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhbmFseXplTXVsdGlMaW5lKGNvb3Jkcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSBhbmFseXplUG9pbnRzKGNvb3Jkc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGFuYWx5emVQb2ludHMoY29vcmRzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIGFuYWx5emVQb2ludChjb29yZHNbaV0pO1xufVxuXG5mdW5jdGlvbiBhbmFseXplUG9pbnQocG9pbnQpIHtcbiAgICBkaW0gPSBNYXRoLm1heChkaW0sIHBvaW50Lmxlbmd0aCk7XG5cbiAgICAvLyBmaW5kIG1heCBwcmVjaXNpb25cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHdoaWxlIChNYXRoLnJvdW5kKHBvaW50W2ldICogZSkgLyBlICE9PSBwb2ludFtpXSAmJiBlIDwgbWF4UHJlY2lzaW9uKSBlICo9IDEwO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2F2ZUtleShrZXkpIHtcbiAgICBpZiAoa2V5c1trZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAga2V5c0Fyci5wdXNoKGtleSk7XG4gICAgICAgIGtleXNba2V5XSA9IGtleXNOdW0rKztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHdyaXRlRmVhdHVyZUNvbGxlY3Rpb24ob2JqLCBwYmYpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5mZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwYmYud3JpdGVNZXNzYWdlKDEsIHdyaXRlRmVhdHVyZSwgb2JqLmZlYXR1cmVzW2ldKTtcbiAgICB9XG4gICAgd3JpdGVQcm9wcyhvYmosIHBiZiwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlRmVhdHVyZShmZWF0dXJlLCBwYmYpIHtcbiAgICBpZiAoZmVhdHVyZS5nZW9tZXRyeSAhPT0gbnVsbCkgcGJmLndyaXRlTWVzc2FnZSgxLCB3cml0ZUdlb21ldHJ5LCBmZWF0dXJlLmdlb21ldHJ5KTtcblxuICAgIGlmIChmZWF0dXJlLmlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmZWF0dXJlLmlkID09PSAnbnVtYmVyJyAmJiBmZWF0dXJlLmlkICUgMSA9PT0gMCkgcGJmLndyaXRlU1ZhcmludEZpZWxkKDEyLCBmZWF0dXJlLmlkKTtcbiAgICAgICAgZWxzZSBwYmYud3JpdGVTdHJpbmdGaWVsZCgxMSwgZmVhdHVyZS5pZCk7XG4gICAgfVxuXG4gICAgaWYgKGZlYXR1cmUucHJvcGVydGllcykgd3JpdGVQcm9wcyhmZWF0dXJlLnByb3BlcnRpZXMsIHBiZik7XG4gICAgd3JpdGVQcm9wcyhmZWF0dXJlLCBwYmYsIHRydWUpO1xufVxuXG5mdW5jdGlvbiB3cml0ZUdlb21ldHJ5KGdlb20sIHBiZikge1xuICAgIHBiZi53cml0ZVZhcmludEZpZWxkKDEsIGdlb21ldHJ5VHlwZXNbZ2VvbS50eXBlXSk7XG5cbiAgICB2YXIgY29vcmRzID0gZ2VvbS5jb29yZGluYXRlcztcblxuICAgIGlmIChnZW9tLnR5cGUgPT09ICdQb2ludCcpIHdyaXRlUG9pbnQoY29vcmRzLCBwYmYpO1xuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PT0gJ011bHRpUG9pbnQnKSB3cml0ZUxpbmUoY29vcmRzLCBwYmYsIHRydWUpO1xuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PT0gJ0xpbmVTdHJpbmcnKSB3cml0ZUxpbmUoY29vcmRzLCBwYmYpO1xuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PT0gJ011bHRpTGluZVN0cmluZycpIHdyaXRlTXVsdGlMaW5lKGNvb3JkcywgcGJmKTtcbiAgICBlbHNlIGlmIChnZW9tLnR5cGUgPT09ICdQb2x5Z29uJykgd3JpdGVNdWx0aUxpbmUoY29vcmRzLCBwYmYsIHRydWUpO1xuICAgIGVsc2UgaWYgKGdlb20udHlwZSA9PT0gJ011bHRpUG9seWdvbicpIHdyaXRlTXVsdGlQb2x5Z29uKGNvb3JkcywgcGJmKTtcbiAgICBlbHNlIGlmIChnZW9tLnR5cGUgPT09ICdHZW9tZXRyeUNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2VvbS5nZW9tZXRyaWVzLmxlbmd0aDsgaSsrKSBwYmYud3JpdGVNZXNzYWdlKDQsIHdyaXRlR2VvbWV0cnksIGdlb20uZ2VvbWV0cmllc1tpXSk7XG4gICAgfVxuXG4gICAgd3JpdGVQcm9wcyhnZW9tLCBwYmYsIHRydWUpO1xufVxuXG5mdW5jdGlvbiB3cml0ZVByb3BzKHByb3BzLCBwYmYsIGlzQ3VzdG9tKSB7XG4gICAgdmFyIGluZGV4ZXMgPSBbXSxcbiAgICAgICAgdmFsdWVJbmRleCA9IDA7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gcHJvcHMpIHtcbiAgICAgICAgaWYgKGlzQ3VzdG9tICYmIGlzU3BlY2lhbEtleShrZXksIHByb3BzLnR5cGUpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBwYmYud3JpdGVNZXNzYWdlKDEzLCB3cml0ZVZhbHVlLCBwcm9wc1trZXldKTtcbiAgICAgICAgaW5kZXhlcy5wdXNoKGtleXNba2V5XSk7XG4gICAgICAgIGluZGV4ZXMucHVzaCh2YWx1ZUluZGV4KyspO1xuICAgIH1cbiAgICBwYmYud3JpdGVQYWNrZWRWYXJpbnQoaXNDdXN0b20gPyAxNSA6IDE0LCBpbmRleGVzKTtcbn1cblxuZnVuY3Rpb24gd3JpdGVWYWx1ZSh2YWx1ZSwgcGJmKSB7XG4gICAgaWYgKHZhbHVlID09PSBudWxsKSByZXR1cm47XG5cbiAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcblxuICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykgcGJmLndyaXRlU3RyaW5nRmllbGQoMSwgdmFsdWUpO1xuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdib29sZWFuJykgcGJmLndyaXRlQm9vbGVhbkZpZWxkKDUsIHZhbHVlKTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JykgcGJmLndyaXRlU3RyaW5nRmllbGQoNiwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAodmFsdWUgJSAxICE9PSAwKSBwYmYud3JpdGVEb3VibGVGaWVsZCgyLCB2YWx1ZSk7XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlID49IDApIHBiZi53cml0ZVZhcmludEZpZWxkKDMsIHZhbHVlKTtcbiAgICAgICAgZWxzZSBwYmYud3JpdGVWYXJpbnRGaWVsZCg0LCAtdmFsdWUpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gd3JpdGVQb2ludChwb2ludCwgcGJmKSB7XG4gICAgdmFyIGNvb3JkcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGltOyBpKyspIGNvb3Jkcy5wdXNoKE1hdGgucm91bmQocG9pbnRbaV0gKiBlKSk7XG4gICAgcGJmLndyaXRlUGFja2VkU1ZhcmludCgzLCBjb29yZHMpO1xufVxuXG5mdW5jdGlvbiB3cml0ZUxpbmUobGluZSwgcGJmKSB7XG4gICAgdmFyIGNvb3JkcyA9IFtdO1xuICAgIHBvcHVsYXRlTGluZShjb29yZHMsIGxpbmUpO1xuICAgIHBiZi53cml0ZVBhY2tlZFNWYXJpbnQoMywgY29vcmRzKTtcbn1cblxuZnVuY3Rpb24gd3JpdGVNdWx0aUxpbmUobGluZXMsIHBiZiwgY2xvc2VkKSB7XG4gICAgdmFyIGxlbiA9IGxpbmVzLmxlbmd0aCxcbiAgICAgICAgaTtcbiAgICBpZiAobGVuICE9PSAxKSB7XG4gICAgICAgIHZhciBsZW5ndGhzID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykgbGVuZ3Rocy5wdXNoKGxpbmVzW2ldLmxlbmd0aCAtIChjbG9zZWQgPyAxIDogMCkpO1xuICAgICAgICBwYmYud3JpdGVQYWNrZWRWYXJpbnQoMiwgbGVuZ3Rocyk7XG4gICAgICAgIC8vIFRPRE8gZmFzdGVyIHdpdGggY3VzdG9tIHdyaXRlTWVzc2FnZT9cbiAgICB9XG4gICAgdmFyIGNvb3JkcyA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykgcG9wdWxhdGVMaW5lKGNvb3JkcywgbGluZXNbaV0sIGNsb3NlZCk7XG4gICAgcGJmLndyaXRlUGFja2VkU1ZhcmludCgzLCBjb29yZHMpO1xufVxuXG5mdW5jdGlvbiB3cml0ZU11bHRpUG9seWdvbihwb2x5Z29ucywgcGJmKSB7XG4gICAgdmFyIGxlbiA9IHBvbHlnb25zLmxlbmd0aCxcbiAgICAgICAgaSwgajtcbiAgICBpZiAobGVuICE9PSAxIHx8IHBvbHlnb25zWzBdLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICB2YXIgbGVuZ3RocyA9IFtsZW5dO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGxlbmd0aHMucHVzaChwb2x5Z29uc1tpXS5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHBvbHlnb25zW2ldLmxlbmd0aDsgaisrKSBsZW5ndGhzLnB1c2gocG9seWdvbnNbaV1bal0ubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgcGJmLndyaXRlUGFja2VkVmFyaW50KDIsIGxlbmd0aHMpO1xuICAgIH1cblxuICAgIHZhciBjb29yZHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHBvbHlnb25zW2ldLmxlbmd0aDsgaisrKSBwb3B1bGF0ZUxpbmUoY29vcmRzLCBwb2x5Z29uc1tpXVtqXSwgdHJ1ZSk7XG4gICAgfVxuICAgIHBiZi53cml0ZVBhY2tlZFNWYXJpbnQoMywgY29vcmRzKTtcbn1cblxuZnVuY3Rpb24gcG9wdWxhdGVMaW5lKGNvb3JkcywgbGluZSwgY2xvc2VkKSB7XG4gICAgdmFyIGksIGosXG4gICAgICAgIGxlbiA9IGxpbmUubGVuZ3RoIC0gKGNsb3NlZCA/IDEgOiAwKSxcbiAgICAgICAgc3VtID0gbmV3IEFycmF5KGRpbSk7XG4gICAgZm9yIChqID0gMDsgaiA8IGRpbTsgaisrKSBzdW1bal0gPSAwO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgZGltOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBuID0gTWF0aC5yb3VuZChsaW5lW2ldW2pdICogZSkgLSBzdW1bal07XG4gICAgICAgICAgICBjb29yZHMucHVzaChuKTtcbiAgICAgICAgICAgIHN1bVtqXSArPSBuO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc1NwZWNpYWxLZXkoa2V5LCB0eXBlKSB7XG4gICAgaWYgKGtleSA9PT0gJ3R5cGUnKSByZXR1cm4gdHJ1ZTtcbiAgICBlbHNlIGlmICh0eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdmZWF0dXJlcycpIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0ZlYXR1cmUnKSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdpZCcgfHwga2V5ID09PSAncHJvcGVydGllcycgfHwga2V5ID09PSAnZ2VvbWV0cnknKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdHZW9tZXRyeUNvbGxlY3Rpb24nKSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdnZW9tZXRyaWVzJykgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChrZXkgPT09ICdjb29yZGluYXRlcycpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5lbmNvZGUgPSByZXF1aXJlKCcuL2VuY29kZScpO1xuZXhwb3J0cy5kZWNvZGUgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuIl19
