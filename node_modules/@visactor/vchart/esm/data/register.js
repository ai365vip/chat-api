export function registerDataSetInstanceTransform(dataSet, name, transform) {
    dataSet.getTransform(name) || dataSet.registerTransform(name, transform);
}

export function registerDataSetInstanceParser(dataSet, name, parse) {
    dataSet.getParser(name) || dataSet.registerParser(name, parse);
}
//# sourceMappingURL=register.js.map