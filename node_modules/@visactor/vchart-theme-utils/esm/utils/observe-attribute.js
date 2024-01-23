export const observeAttribute = (element, attribute, callback) => {
    new MutationObserver((mutations => {
        mutations.forEach((mutation => {
            mutation.attributeName === attribute && callback(mutation);
        }));
    })).observe(element, {
        attributes: !0
    });
};
//# sourceMappingURL=observe-attribute.js.map