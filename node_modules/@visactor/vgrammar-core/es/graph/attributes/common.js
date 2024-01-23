export const commonAttributes = [ "fillOpacity" ];

export const transformCommonAttribute = (graphicAttributes, changedKey, nextAttrs) => {
    var _a;
    return "fillOpacity" === changedKey ? (graphicAttributes.fillOpacity = null !== (_a = nextAttrs.fillOpacity) && void 0 !== _a ? _a : 1, 
    [ "fillOpacity" ]) : [];
};
//# sourceMappingURL=common.js.map
