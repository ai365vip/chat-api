module.exports = mergeViableLineStrings

// [Number, Number] -> String
function coordId (coord) {
  return coord[0].toString() + ',' + coord[1].toString()
}

// LineString, LineString -> LineString
function mergeLineStrings (a, b) {
  var s1 = coordId(a.coordinates[0])
  var e1 = coordId(a.coordinates[a.coordinates.length - 1])
  var s2 = coordId(b.coordinates[0])
  var e2 = coordId(b.coordinates[b.coordinates.length - 1])

  // TODO: handle case where more than one of these is true!

  var coords
  if (s1 === e2) {
    coords = b.coordinates.concat(a.coordinates.slice(1))
  } else if (s2 === e1) {
    coords = a.coordinates.concat(b.coordinates.slice(1))
  } else if (s1 === s2) {
    coords = a.coordinates.slice(1).reverse().concat(b.coordinates)
  } else if (e1 === e2) {
    coords = a.coordinates.concat(b.coordinates.reverse().slice(1))
  } else {
    return null
  }

  return {
    type: 'LineString',
    coordinates: coords
  }
}

// Merges all connected (non-forking, non-junctioning) line strings into single
// line strings.
// [LineString] -> LineString|MultiLineString
function mergeViableLineStrings (geoms) {
  // TODO: assert all are linestrings

  var lineStrings = geoms.slice()
  var result = []
  while (lineStrings.length > 0) {
    var ls = lineStrings.shift()

    // Attempt to merge this LineString with the other LineStrings, updating
    // the reference as it is merged with others and grows.
    lineStrings = lineStrings.reduce(function (accum, cur) {
      var merged = mergeLineStrings(ls, cur)
      if (merged) {
        // Accumulate the merged LineString
        ls = merged
      } else {
        // Put the unmerged LineString back into the list
        accum.push(cur)
      }
      return accum
    }, [])

    result.push(ls)
  }

  if (result.length === 1) {
    result = result[0]
  } else {
    result = {
      type: 'MultiLineString',
      coordinates: result.map(function (ls) { return ls.coordinates })
    }
  }
  return result
}

