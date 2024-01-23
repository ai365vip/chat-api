function isPromise(object) {
    return ("object" == typeof object && null !== object || "function" == typeof object) && "function" == typeof object.then;
}

function isPromiseOrContainsPromise(object) {
    return !!isPromise(object) || Array.isArray(object) && object.some(isPromise);
}

export { isPromise, isPromiseOrContainsPromise };
//# sourceMappingURL=async.js.map
