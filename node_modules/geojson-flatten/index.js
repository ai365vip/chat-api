export default function flatten(gj) {
  switch ((gj && gj.type) || null) {
    case "FeatureCollection":
      gj.features = gj.features.reduce(function(mem, feature) {
        return mem.concat(flatten(feature));
      }, []);
      return gj;
    case "Feature":
      if (!gj.geometry) return gj;
      return flatten(gj.geometry).map(function(geom) {
        var data = {
          type: "Feature",
          properties: JSON.parse(JSON.stringify(gj.properties)),
          geometry: geom
        };
        if (gj.id !== undefined) {
          data.id = gj.id;
        }
        return data;
      });
    case "MultiPoint":
      return gj.coordinates.map(function(_) {
        return { type: "Point", coordinates: _ };
      });
    case "MultiPolygon":
      return gj.coordinates.map(function(_) {
        return { type: "Polygon", coordinates: _ };
      });
    case "MultiLineString":
      return gj.coordinates.map(function(_) {
        return { type: "LineString", coordinates: _ };
      });
    case "GeometryCollection":
      return gj.geometries.map(flatten).reduce(function(memo, geoms) {
        return memo.concat(geoms);
      }, []);
    case "Point":
    case "Polygon":
    case "LineString":
      return [gj];
  }
}
