"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.QueryableString = void 0;

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

exports.QueryableString = QueryableString;
//# sourceMappingURL=queryable_string.js.map
