# slice-source

A [readable stream reader](https://streams.spec.whatwg.org/#readable-stream-reader) that allows you to pull the specified number of bytes from the underlying readable stream. For example:

```html
<!DOCTYPE html>
<script src="https://unpkg.com/slice-source@0"></script>
<script>

fetch("https://cors-anywhere.herokuapp.com/")
  .then(response => {
    return (function read(reader) {
      return reader.slice(40).then(value => {
        if (value == null) return;
        console.log(value);
        return read(reader);
      });
    })(sources.slice(response.body));
  })
  .catch(error => console.error(error.stack));

</script>
```

## API Reference

<a name="slice" href="#slice">#</a> <b>slice</b>(<i>stream</i>) [<>](https://github.com/mbostock/slice-source/blob/master/index.js#L4 "Source")
<br><a href="#slice">#</a> <b>slice</b>(<i>reader</i>)
<br><a href="#slice">#</a> <b>slice</b>(<i>source</i>)

If the specified *source* exposes a *source*.slice method, it is assumed to be a sliceable *source* and returned as-is. Otherwise, if the specified *reader* exposes a *reader*.read method, it is assumed to be a [readable stream *reader*](https://streams.spec.whatwg.org/#readable-stream-reader), and a new sliceable *source* for the specified *reader* is returned. Otherwise, the specified *reader* is assumed to be a [readable *stream*](https://streams.spec.whatwg.org/#rs), and a new sliceable *source* for the reader returned by *stream*.getReader is returned.

<a name="source_slice" href="#source_slice">#</a> <i>source</i>.<b>slice</b>(<i>length</i>) [<>](https://github.com/mbostock/slice-source/blob/master/read.js "Source")

Returns a Promise for the next chunk of data from the underlying stream, yielding a [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) of *length* bytes, or the remaining bytes of the underlying stream if the underlying stream has more than zero but fewer than *length* bytes remaining, or null when no bytes remain in the stream.

<a name="source_read" href="#source_read">#</a> <i>source</i>.<b>read</b>() [<>](https://github.com/mbostock/slice-source/blob/master/read.js "Source")

Returns a Promise for the next chunk of data from the underlying stream. The yielded result is an object with the following properties:

* `value` - a [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), or undefined if the stream ended
* `done` - a boolean which is true if the stream ended

<a name="source_cancel" href="#source_cancel">#</a> <i>source</i>.<b>cancel</b>() [<>](https://github.com/mbostock/slice-source/blob/master/cancel.js "Source")

Returns a Promise which is resolved when the underlying stream has been destroyed.
