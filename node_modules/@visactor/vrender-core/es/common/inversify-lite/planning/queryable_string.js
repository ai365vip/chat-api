class QueryableString {
    constructor(str) {
        this.str = str;
    }
    contains(searchString) {
        return -1 !== this.str.indexOf(searchString);
    }
    equals(compareString) {
        return this.str === compareString;
    }
    value() {
        return this.str;
    }
}

export { QueryableString };
//# sourceMappingURL=queryable_string.js.map
