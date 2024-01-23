// https://github.com/mbostock/stream-source Version 0.3.5. Copyright 2017 Mike Bostock.
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.sources = global.sources || {}, global.sources.stream = factory());
}(this, (function () { 'use strict';

function stream(source) {
  return typeof source.read === "function" ? source : source.getReader();
}

return stream;

})));
