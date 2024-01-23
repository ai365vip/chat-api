export const linkDotInfo = (data, op) => {
    const {infoKey: infoKey, fields: fields, linkData: linkData, dotData: dotData} = op, {fromField: fromField, toField: toField, xField: xField, yField: yField} = fields(), dataLinkObj = linkData(), dataDotObj = dotData(), dataLinkDotHash = {};
    return dataDotObj.forEach((datum => {
        const dataCopy = {};
        for (const key in datum) key !== infoKey && (dataCopy[key] = datum[key]);
        const dataOp = datum[infoKey];
        null == dataOp || dataOp.forEach((d => {
            dataLinkDotHash[d.node_name] = Object.assign({}, dataCopy, d);
        }));
    })), dataLinkObj.forEach((datum => {
        var _a, _b, _c, _d;
        datum[fromField + "_xField"] = null === (_a = null == dataLinkDotHash ? void 0 : dataLinkDotHash[datum[fromField]]) || void 0 === _a ? void 0 : _a[xField], 
        datum[fromField + "_yField"] = null === (_b = null == dataLinkDotHash ? void 0 : dataLinkDotHash[datum[fromField]]) || void 0 === _b ? void 0 : _b[yField], 
        datum[toField + "_xField"] = null === (_c = null == dataLinkDotHash ? void 0 : dataLinkDotHash[datum[toField]]) || void 0 === _c ? void 0 : _c[xField], 
        datum[toField + "_yField"] = null === (_d = null == dataLinkDotHash ? void 0 : dataLinkDotHash[datum[toField]]) || void 0 === _d ? void 0 : _d[yField];
    })), dataLinkObj;
};
//# sourceMappingURL=link-dot-info.js.map
