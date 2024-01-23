"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.UniqueList = void 0;

const vgrammar_util_1 = require("@visactor/vgrammar-util");

class UniqueList {
    constructor(idFunc) {
        this.list = [], this.ids = {}, this.idFunc = idFunc || vgrammar_util_1.identity;
    }
    add(element) {
        const id = this.idFunc(element);
        return this.ids[id] || (this.ids[id] = 1, this.list.push(element)), this;
    }
    remove(element) {
        const id = this.idFunc(element);
        return this.ids[id] && (this.ids[id] = 0, this.list = this.list.filter((entry => entry !== element))), 
        this;
    }
    forEach(callback, reverse) {
        reverse ? this.list.slice().reverse().forEach(callback) : this.list.forEach(callback);
    }
    filter(callback) {
        return this.list.filter(callback);
    }
    get length() {
        return this.list.length;
    }
    getElementByIndex(index) {
        return this.list[index];
    }
}

exports.UniqueList = UniqueList;
//# sourceMappingURL=unique-list.js.map
