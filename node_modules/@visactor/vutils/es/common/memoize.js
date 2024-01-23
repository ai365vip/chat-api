export const memoize = func => {
    let lastArgs = null, lastResult = null;
    return (...args) => (lastArgs && args.every(((val, i) => val === lastArgs[i])) || (lastArgs = args, 
    lastResult = func(...args)), lastResult);
};
//# sourceMappingURL=memoize.js.map
