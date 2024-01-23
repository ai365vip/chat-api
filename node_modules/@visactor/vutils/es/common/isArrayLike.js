const isArrayLike = function(value) {
    return null !== value && "function" != typeof value && Number.isFinite(value.length);
};

export default isArrayLike;
//# sourceMappingURL=isArrayLike.js.map