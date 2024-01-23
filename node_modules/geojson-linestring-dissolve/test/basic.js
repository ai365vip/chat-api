var test = require('tape')
var dissolve = require('../')

test('single way -> LineString', function (t) {
  var data = [
    {
      'type': 'LineString',
      'coordinates': [
        [ 0, 0 ],
        [ 1, 1 ]
      ]
    }
  ]

  var expected = {
    type: 'LineString',
    coordinates: [
      [0.0, 0.0],
      [1.0, 1.0]
    ]
  }

  var actual = dissolve(data)
  t.deepEqual(actual, expected)
  t.end()
})

test('two disconnected ways -> MultiLineString', function (t) {
  var data = [
    {
      'type': 'LineString',
      'coordinates': [
        [ 0, 0 ],
        [ 1, 1 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 2, 2 ],
        [ 3, 3 ]
      ]
    }
  ]

  var expected = {
    type: 'MultiLineString',
    coordinates: [
      [
        [0.0, 0.0],
        [1.0, 1.0]
      ],
      [
        [2.0, 2.0],
        [3.0, 3.0]
      ]
    ]
  }

  var actual = dissolve(data)
  t.deepEqual(actual, expected)
  t.end()
})

test('two connected ways -> LineString', function (t) {
  var data = [
    {
      'type': 'LineString',
      'coordinates': [
        [ 0, 0 ],
        [ 1, 1 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 1, 1 ],
        [ 2, 2 ]
      ]
    }
  ]

  var expected = {
    type: 'LineString',
    coordinates: [
      [0.0, 0.0],
      [1.0, 1.0],
      [2.0, 2.0]
    ]
  }

  var actual = dissolve(data)
  t.deepEqual(actual, expected)
  t.end()
})

test('two connected ways -> LineString (opposite order)', function (t) {
  var data = [
    {
      'type': 'LineString',
      'coordinates': [
        [ 0, 0 ],
        [ 1, 1 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 2, 2 ],
        [ 1, 1 ]
      ]
    }
  ]

  var expected = {
    type: 'LineString',
    coordinates: [
      [0.0, 0.0],
      [1.0, 1.0],
      [2.0, 2.0]
    ]
  }

  var actual = dissolve(data)
  t.deepEqual(actual, expected)
  t.end()
})

test('two connected ways /w heads touching -> LineString', function (t) {
  var data = [
    {
      'type': 'LineString',
      'coordinates': [
        [ 0, 0 ],
        [ 1, 1 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 0, 0 ],
        [ 2, 2 ]
      ]
    }
  ]

  var expected = {
    type: 'LineString',
    coordinates: [
      [1.0, 1.0],
      [0.0, 0.0],
      [2.0, 2.0]
    ]
  }

  var actual = dissolve(data)
  t.deepEqual(actual, expected)
  t.end()
})

test('two connected ways /w tails touching -> LineString', function (t) {
  var data = [
    {
      'type': 'LineString',
      'coordinates': [
        [ 0, 0 ],
        [ 1, 1 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 2, 2 ],
        [ 1, 1 ]
      ]
    }
  ]

  var expected = {
    type: 'LineString',
    coordinates: [
      [0.0, 0.0],
      [1.0, 1.0],
      [2.0, 2.0]
    ]
  }

  var actual = dissolve(data)
  t.deepEqual(actual, expected)
  t.end()
})

test('three connected ways -> LineString', function (t) {
  var data = [
    {
      'type': 'LineString',
      'coordinates': [
        [ 1, 1 ],
        [ 2, 2 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 2, 2 ],
        [ 3, 3 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 0, 0 ],
        [ 1, 1 ]
      ]
    }
  ]

  var expected = {
    type: 'LineString',
    coordinates: [
      [0.0, 0.0],
      [1.0, 1.0],
      [2.0, 2.0],
      [3.0, 3.0]
    ]
  }

  var actual = dissolve(data)
  t.deepEqual(actual, expected)
  t.end()
})

test('two ways -> MultiLineString /w two LineStrings', function (t) {
  var data = [
    {
      'type': 'LineString',
      'coordinates': [
        [ 0, 0 ],
        [ 1, 1 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 2, 2 ],
        [ 3, 3 ]
      ]
    }
  ]

  var expected = {
    type: 'MultiLineString',
    coordinates: [
      [
        [0.0, 0.0],
        [1.0, 1.0]
      ],
      [
        [2.0, 2.0],
        [3.0, 3.0]
      ]
    ]
  }

  var actual = dissolve(data)
  t.deepEqual(actual, expected)
  t.end()
})

test('four ways -> MultiLineString /w two LineStrings', function (t) {
  var data = [
    {
      'type': 'LineString',
      'coordinates': [
        [ 0, 0 ],
        [ 1, 1 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 1, 1 ],
        [ 2, 2 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 3, 3 ],
        [ 4, 4 ]
      ]
    },
    {
      'type': 'LineString',
      'coordinates': [
        [ 4, 4 ],
        [ 5, 5 ]
      ]
    }
  ]

  var expected = {
    type: 'MultiLineString',
    coordinates: [
      [
        [0.0, 0.0],
        [1.0, 1.0],
        [2.0, 2.0]
      ],
      [
        [3.0, 3.0],
        [4.0, 4.0],
        [5.0, 5.0]
      ]
    ]
  }

  var actual = dissolve(data)
  t.deepEqual(actual, expected)
  t.end()
})

test('many long ways -> LineString', function (t) {
  var _id = 1
  function id () {
    return '' + (_id++)
  }

  var data = (new Array(10)).fill(0).map(function (_, idx) {
    var lastTail = [(idx + 1) * 50, (idx + 1) * 50]
    return {
      type: 'LineString',
      id: id(),
      coordinates: (new Array(50)).fill(0).map(function (_, jdx) {
        var coord = idx * 50 + jdx
        return [coord, coord]
      }).concat([lastTail])
    }
  })

  var expected = {
    type: 'LineString',
    coordinates: data.reduce(function (accum, ls) {
      var coords = ls.coordinates
      if (accum.length > 0) coords = ls.coordinates.slice(1)
      return accum.concat(coords)
    }, [])
  }

  var actual = dissolve(data)
  t.deepEqual(actual, expected)
  t.end()
})

