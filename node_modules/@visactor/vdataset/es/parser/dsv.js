import { dsvFormat, csvParse, tsvParse } from "d3-dsv";

import { isString } from "@visactor/vutils";

import { DATAVIEW_TYPE } from "../constants";

import { mergeDeepImmer } from "../utils/js";

const DEFAULT_DSV_PARSER_OPTIONS = {
    delimiter: ","
};

export const dsvParser = (data, options = {}, dataView) => {
    dataView.type = DATAVIEW_TYPE.DSV;
    const mergeOptions = mergeDeepImmer(DEFAULT_DSV_PARSER_OPTIONS, options), {delimiter: delimiter} = mergeOptions;
    if (!isString(delimiter)) throw new TypeError("Invalid delimiter: must be a string!");
    return dsvFormat(delimiter).parse(data);
};

export const csvParser = (data, options = {}, dataView) => (dataView.type = DATAVIEW_TYPE.DSV, 
csvParse(data));

export const tsvParser = (data, options = {}, dataView) => (dataView.type = DATAVIEW_TYPE.DSV, 
tsvParse(data));
//# sourceMappingURL=dsv.js.map