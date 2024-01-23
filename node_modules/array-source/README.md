# array-source

A [readable stream reader](https://streams.spec.whatwg.org/#readable-stream-reader) for reading from an in-memory array.

## API Reference

<a name="array" href="#array">#</a> <b>array</b>(<i>array</i>) [<>](https://github.com/mbostock/array-source/blob/master/index.js#L4 "Source")
<br><a href="#array">#</a> <b>array</b>(<i>length</i>)
<br><a href="#array">#</a> <b>array</b>(<i>object</i>)
<br><a href="#array">#</a> <b>array</b>(<i>buffer</i>)

Returns a sliceable *source* for the specified [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array). If the specified *array* is not a Uint8Array, it is passed to the Uint8Array constructor to create a new array; see the [TypedArray constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#Syntax) for details.

<a name="source_read" href="#source_read">#</a> <i>source</i>.<b>read</b>() [<>](https://github.com/mbostock/array-source/blob/master/read.js "Source")

Returns a Promise for the next chunk of data from the underlying stream. The yielded result is an object with the following properties:

* `value` - a [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), or undefined if the stream ended
* `done` - a boolean which is true if the stream ended

<a name="source_cancel" href="#source_cancel">#</a> <i>source</i>.<b>cancel</b>() [<>](https://github.com/mbostock/array-source/blob/master/cancel.js "Source")

Returns a Promise which is resolved when the underlying stream has been destroyed.
