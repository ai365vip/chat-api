export const transform = (options, upstreamData) => {
    if (!upstreamData || !upstreamData.length) return [];
    const {fields: fields, asKey: asKey = "key", asValue: asValue = "value", retains: retains} = options, results = [];
    for (let i = 0, len = upstreamData.length; i < len; i++) {
        const entry = upstreamData[i];
        fields.forEach((field => {
            const item = {};
            if (retains) retains.forEach((retain => {
                item[retain] = entry[retain];
            })); else for (const prop in entry) -1 === fields.indexOf(prop) && (item[prop] = entry[prop]);
            item[asKey] = field, item[asValue] = entry[field], results.push(item);
        }));
    }
    return results;
};
//# sourceMappingURL=fold.js.map
