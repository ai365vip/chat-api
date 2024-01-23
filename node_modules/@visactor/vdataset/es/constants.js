export var DATAVIEW_TYPE;

!function(DATAVIEW_TYPE) {
    DATAVIEW_TYPE.DSV = "dsv", DATAVIEW_TYPE.TREE = "tree", DATAVIEW_TYPE.GEO = "geo", 
    DATAVIEW_TYPE.BYTE = "bytejson", DATAVIEW_TYPE.HEX = "hex", DATAVIEW_TYPE.GRAPH = "graph", 
    DATAVIEW_TYPE.TABLE = "table", DATAVIEW_TYPE.GEO_GRATICULE = "geo-graticule";
}(DATAVIEW_TYPE || (DATAVIEW_TYPE = {}));

export const STATISTICS_METHODS = [ "max", "mean", "median", "min", "mode", "product", "standardDeviation", "sum", "sumSimple", "variance" ];