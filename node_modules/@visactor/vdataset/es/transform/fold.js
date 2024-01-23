export const fold = (data, options) => {
    const {fields: fields, key: key, value: value, retains: retains} = options, results = [];
    for (let i = 0; i < data.length; i++) fields.forEach((field => {
        const item = {};
        if (item[key] = field, item[value] = data[i][field], retains) retains.forEach((retain => {
            item[retain] = data[i][retain];
        })); else for (const prop in data[i]) -1 === fields.indexOf(prop) && (item[prop] = data[i][prop]);
        results.push(item);
    }));
    return results;
};
//# sourceMappingURL=fold.js.map