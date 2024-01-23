import { OrderedObjParser } from "./OrderedObjParser";

import { prettify } from "./node2json";

export class XMLParser {
    constructor(options) {
        this.options = Object.assign({}, XMLParser.defaultOptions, options);
    }
    valid(xml) {
        return xml.startsWith("<");
    }
    parse(xmlData) {
        if (!this.valid) return !1;
        const orderedResult = new OrderedObjParser(this.options).parseXml(xmlData);
        return prettify(orderedResult, this.options);
    }
}

XMLParser.defaultOptions = {};

export function isSvg(str) {
    return str.startsWith("<svg") || str.startsWith("<?xml");
}

export function isXML(str) {
    return str.startsWith("<");
}
//# sourceMappingURL=parser.js.map
