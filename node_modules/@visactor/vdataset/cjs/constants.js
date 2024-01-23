"use strict";

var DATAVIEW_TYPE;

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.STATISTICS_METHODS = exports.DATAVIEW_TYPE = void 0, function(DATAVIEW_TYPE) {
    DATAVIEW_TYPE.DSV = "dsv", DATAVIEW_TYPE.TREE = "tree", DATAVIEW_TYPE.GEO = "geo", 
    DATAVIEW_TYPE.BYTE = "bytejson", DATAVIEW_TYPE.HEX = "hex", DATAVIEW_TYPE.GRAPH = "graph", 
    DATAVIEW_TYPE.TABLE = "table", DATAVIEW_TYPE.GEO_GRATICULE = "geo-graticule";
}(DATAVIEW_TYPE = exports.DATAVIEW_TYPE || (exports.DATAVIEW_TYPE = {})), exports.STATISTICS_METHODS = [ "max", "mean", "median", "min", "mode", "product", "standardDeviation", "sum", "sumSimple", "variance" ];