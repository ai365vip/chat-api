export const fields = (data, options) => {
    var _a, _b;
    if (!(null == options ? void 0 : options.fields)) return data;
    if (0 === data.length) return data;
    const fields = options.fields, dataTemp = data[0], filterFields = {}, sortFields = [];
    for (const key in fields) if (Object.prototype.hasOwnProperty.call(fields, key)) {
        const fieldInfo = fields[key];
        if (!fieldInfo.type) {
            let dataCheck = dataTemp;
            key in dataTemp || (dataCheck = null !== (_a = data.find((d => key in d))) && void 0 !== _a ? _a : dataTemp), 
            fieldInfo.type = "number" == typeof dataCheck[key] ? "linear" : "ordinal";
        }
        let sortInfo;
        if ("number" == typeof fieldInfo.sortIndex && (sortInfo = {
            key: key,
            type: fieldInfo.type,
            index: fieldInfo.sortIndex,
            sortIndex: {},
            sortIndexCount: 0,
            sortReverse: !0 === fieldInfo.sortReverse
        }, sortFields.push(sortInfo)), (null === (_b = fieldInfo.domain) || void 0 === _b ? void 0 : _b.length) > 0) if ("ordinal" === fieldInfo.type) {
            fieldInfo._domainCache = {}, filterFields[key] = fieldInfo;
            const _domainCache = {};
            fieldInfo.domain.forEach(((d, i) => {
                _domainCache[d] = i, fieldInfo._domainCache[d] = i;
            })), sortInfo && (sortInfo.sortIndex = _domainCache, sortInfo.sortIndexCount = fieldInfo.domain.length);
        } else fieldInfo.domain.length >= 2 && (filterFields[key] = fieldInfo);
    }
    return Object.keys(filterFields).length > 0 && (data = data.filter((d => {
        for (const key in filterFields) {
            const fieldInfo = filterFields[key];
            if ("ordinal" === fieldInfo.type) {
                if (!(d[key] in fieldInfo._domainCache)) return !1;
            } else if (fieldInfo.domain[0] > d[key] || fieldInfo.domain[1] < d[key]) return !1;
        }
        return !0;
    }))), sortFields.sort(((a, b) => a.index - b.index)), data.sort(((a, b) => sortData(a, b, sortFields))), 
    data;
};

function sortData(a, b, sortFields) {
    for (let i = 0; i < sortFields.length; i++) {
        const sortInfo = sortFields[i];
        let v = 0;
        if ("ordinal" === sortInfo.type ? (void 0 === sortInfo.sortIndex[b[sortInfo.key]] && (sortInfo.sortIndex[b[sortInfo.key]] = sortInfo.sortIndexCount++), 
        void 0 === sortInfo.sortIndex[a[sortInfo.key]] && (sortInfo.sortIndex[a[sortInfo.key]] = sortInfo.sortIndexCount++), 
        v = sortInfo.sortIndex[a[sortInfo.key]] - sortInfo.sortIndex[b[sortInfo.key]]) : "linear" === sortInfo.type && (v = a[sortInfo.key] - b[sortInfo.key]), 
        sortInfo.sortReverse && (v = -v), 0 !== v) return v;
    }
    return 0;
}
//# sourceMappingURL=fields.js.map