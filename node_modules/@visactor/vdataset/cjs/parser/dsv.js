"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.tsvParser = exports.csvParser = exports.dsvParser = void 0;

const d3_dsv_1 = require("d3-dsv"), vutils_1 = require("@visactor/vutils"), constants_1 = require("../constants"), js_1 = require("../utils/js"), DEFAULT_DSV_PARSER_OPTIONS = {
    delimiter: ","
}, dsvParser = (data, options = {}, dataView) => {
    dataView.type = constants_1.DATAVIEW_TYPE.DSV;
    const mergeOptions = (0, js_1.mergeDeepImmer)(DEFAULT_DSV_PARSER_OPTIONS, options), {delimiter: delimiter} = mergeOptions;
    if (!(0, vutils_1.isString)(delimiter)) throw new TypeError("Invalid delimiter: must be a string!");
    return (0, d3_dsv_1.dsvFormat)(delimiter).parse(data);
};

exports.dsvParser = dsvParser;

const csvParser = (data, options = {}, dataView) => (dataView.type = constants_1.DATAVIEW_TYPE.DSV, 
(0, d3_dsv_1.csvParse)(data));

exports.csvParser = csvParser;

const tsvParser = (data, options = {}, dataView) => (dataView.type = constants_1.DATAVIEW_TYPE.DSV, 
(0, d3_dsv_1.tsvParse)(data));

exports.tsvParser = tsvParser;
//# sourceMappingURL=dsv.js.map