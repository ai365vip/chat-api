"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isXML = exports.isSvg = exports.XMLParser = void 0;

const OrderedObjParser_1 = require("./OrderedObjParser"), node2json_1 = require("./node2json");

class XMLParser {
    constructor(options) {
        this.options = Object.assign({}, XMLParser.defaultOptions, options);
    }
    valid(xml) {
        return xml.startsWith("<");
    }
    parse(xmlData) {
        if (!this.valid) return !1;
        const orderedResult = new OrderedObjParser_1.OrderedObjParser(this.options).parseXml(xmlData);
        return (0, node2json_1.prettify)(orderedResult, this.options);
    }
}

function isSvg(str) {
    return str.startsWith("<svg") || str.startsWith("<?xml");
}

function isXML(str) {
    return str.startsWith("<");
}

exports.XMLParser = XMLParser, XMLParser.defaultOptions = {}, exports.isSvg = isSvg, 
exports.isXML = isXML;
//# sourceMappingURL=parser.js.map
