export const filter = (data, options) => {
    const {callback: callback} = options;
    return callback && (data = data.filter(callback)), data;
};
//# sourceMappingURL=filter.js.map