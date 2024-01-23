// https://github.com/mbostock/path-source Version 0.1.3. Copyright 2017 Mike Bostock.
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('array-source')) :
	typeof define === 'function' && define.amd ? define(['array-source'], factory) :
	(global.sources = global.sources || {}, global.sources.path = factory(global.sources.array));
}(this, (function (array) { 'use strict';

array = array && array.hasOwnProperty('default') ? array['default'] : array;

var fetchPath = function(url) {
  return fetch(url).then(function(response) {
    return response.body && response.body.getReader
        ? response.body.getReader()
        : response.arrayBuffer().then(array);
  });
};

var requestPath = function(url) {
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest;
    request.responseType = "arraybuffer";
    request.onload = function() { resolve(array(request.response)); };
    request.onerror = reject;
    request.ontimeout = reject;
    request.open("GET", url, true);
    request.send();
  });
};

function path(path) {
  return (typeof fetch === "function" ? fetchPath : requestPath)(path);
}

return path;

})));
