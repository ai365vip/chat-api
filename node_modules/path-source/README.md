# path-source

A [readable stream reader](https://streams.spec.whatwg.org/#readable-stream-reader) for reading files in Node or fetching URLs in browser. For example, to read a file in Node:

```js
var path = require("path-source");

path("README.md")
  .then(function read(source) {
    return source.read().then(result => {
      if (result.done) return;
      process.stdout.write(result.value);
      return read(source);
    });
  })
  .catch(error => console.error(error.stack));
```

Similarly, to fetch a resource in a browser (requires [array-source](https://github.com/mbostock/array-source) if [streaming fetch](https://www.chromestatus.com/feature/5804334163951616) is not supported):

```html
<!DOCTYPE html>
<script src="https://unpkg.com/array-source@0"></script>
<script src="https://unpkg.com/path-source@0"></script>
<script>

sources.path("README.md")
  .then(function read(source) {
    return source.read().then(result => {
      if (result.done) return;
      console.log(result.value);
      return read(source);
    });
  })
  .catch(error => console.error(error.stack));

</script>
```

## API Reference

<a name="path" href="#path">#</a> <b>path</b>(<i>path</i>[, <i>options</i>]) [<>](https://github.com/mbostock/path-source/blob/master/index.js "Source")

In Node, returns a Promise that yields a *source* for the file at the specified *path*; equivalent to [file-source](https://github.com/mbostock/file-source#file). In a browser, returns a Promise that yields a *source* for the resource at the specified *path* URL, using [streaming fetch](https://www.chromestatus.com/feature/5804334163951616) if available, and falling back to a [binary data](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data) [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

In Node, the following options are supported:

* `highWaterMark` - the stream’s internal buffer size; defaults to 65,536

In a browser, no options are currently supported.

<a name="source_read" href="#source_read">#</a> <i>source</i>.<b>read</b>() [<>](https://github.com/mbostock/stream-source/blob/master/read.js "Source")

Returns a Promise for the next chunk of data from the underlying stream. The yielded result is an object with the following properties:

* `value` - a [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) (a [Buffer](https://nodejs.org/api/buffer.html)), or undefined if the stream ended
* `done` - a boolean which is true if the stream ended

<a name="source_cancel" href="#source_cancel">#</a> <i>source</i>.<b>cancel</b>() [<>](https://github.com/mbostock/slice-source/blob/master/cancel.js "Source")

Returns a Promise which is resolved when the underlying stream has been destroyed.
