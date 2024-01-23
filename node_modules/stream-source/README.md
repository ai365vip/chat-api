# stream-source

A [readable stream reader](https://streams.spec.whatwg.org/#readable-stream-reader) implementation on top of a Node [readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable). This library allows you to write code that takes a *source* as input, and can work with either native readable streams or Node streams. For example:

```js
var stream = require("stream-source");

function read(source) {
  return source.slice(40).then(value => {
    if (value == null) return;
    process.stdout.write(value);
    return read(source);
  });
}

read(stream(process.stdin))
  .catch(error => console.error(error.stack));
```

## API Reference

<a name="stream" href="#stream">#</a> <b>stream</b>(<i>stream</i>) [<>](https://github.com/mbostock/stream-source/blob/master/index.js#L1 "Source")
<br><a href="#stream">#</a> <b>stream</b>(<i>reader</i>)

In Node, returns a [sliceable](https://github.com/mbostock/slice-source) *source* for the specified Node [readable *stream*](https://nodejs.org/api/stream.html#stream_class_stream_readable). In a browser, if the specified *reader* exposes a *reader*.read method, it is assumed to be a [readable stream *reader*](https://streams.spec.whatwg.org/#readable-stream-reader), and the specified *reader* is returned as-is. Otherwise, the specified *reader* is assumed to be a [readable *stream*](https://streams.spec.whatwg.org/#rs), and the reader returned by *stream*.getReader is returned.

<a name="source_slice" href="#source_slice">#</a> <i>source</i>.<b>slice</b>(<i>length</i>) [<>](https://github.com/mbostock/stream-source/blob/master/slice.js "Source")

Returns a Promise for the next chunk of data from the underlying stream, yielding a [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) (a [Buffer](https://nodejs.org/api/buffer.html)) of *length* bytes, or the remaining bytes of the underlying stream if the underlying stream has more than zero but fewer than *length* bytes remaining, or null when no bytes remain in the stream.

<a name="source_read" href="#source_read">#</a> <i>source</i>.<b>read</b>() [<>](https://github.com/mbostock/stream-source/blob/master/read.js "Source")

Returns a Promise for the next chunk of data from the underlying stream. The yielded result is an object with the following properties:

* `value` - a [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) (a [Buffer](https://nodejs.org/api/buffer.html)), or undefined if the stream ended
* `done` - a boolean which is true if the stream ended

<a name="source_cancel" href="#source_cancel">#</a> <i>source</i>.<b>cancel</b>() [<>](https://github.com/mbostock/slice-source/blob/master/cancel.js "Source")

Returns a Promise which is resolved when the underlying stream has been destroyed.
