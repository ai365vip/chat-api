"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.transformCommonAttribute = exports.commonAttributes = void 0, exports.commonAttributes = [ "fillOpacity" ];

const transformCommonAttribute = (graphicAttributes, changedKey, nextAttrs) => {
    var _a;
    return "fillOpacity" === changedKey ? (graphicAttributes.fillOpacity = null !== (_a = nextAttrs.fillOpacity) && void 0 !== _a ? _a : 1, 
    [ "fillOpacity" ]) : [];
};

exports.transformCommonAttribute = transformCommonAttribute;
//# sourceMappingURL=common.js.map
