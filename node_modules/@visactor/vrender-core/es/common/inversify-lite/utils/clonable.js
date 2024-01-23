function isClonable(obj) {
    return "object" == typeof obj && null !== obj && "clone" in obj && "function" == typeof obj.clone;
}

export { isClonable };
//# sourceMappingURL=clonable.js.map
