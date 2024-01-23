#!/usr/bin/env node

var simplify = require('./')
var fs = require('fs')
var argv = require('minimist')(process.argv.slice(2))
var concat = require('concat-stream')
var path = require('path')
var usage = fs.readFileSync(path.join(__dirname, 'usage.txt'), { encoding: 'utf8' })
var stdin

var tolerance = argv.t || argv.tolerance || 0.001
tolerance = +tolerance // cast to Number

if (argv.help || argv.h) {
  console.log(usage)
  process.exit()
}

if (argv._[0] && argv._[0] !== '-') {
  stdin = fs.createReadStream(argv._[0])
} else if (!process.stdin.isTTY || argv._[0] === '-') {
  stdin = process.stdin
} else {
  console.log(usage)
  process.exit(1)
}

// buffer all input TODO streaming simplification
stdin.pipe(concat(function (buffer) {
  try {
    var geojson = JSON.parse(buffer)
  } catch (e) {
    return console.error(e)
  }
  var result = simplify(geojson, tolerance)
  if (result instanceof Error) return console.error(result)
  console.log(JSON.stringify(result, null, 2))
}))
