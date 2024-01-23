"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.MarkSet = void 0;

const vutils_1 = require("@visactor/vutils");

class MarkSet {
    constructor() {
        this._children = [], this._markNameMap = {}, this._infoMap = new Map;
    }
    getMarkNameMap() {
        return this._markNameMap;
    }
    addMark(mark, markInfo) {
        (0, vutils_1.isNil)(mark) || (this._children.push(mark), this._markNameMap[mark.name] = mark, 
        this._infoMap.set(mark, (0, vutils_1.merge)({}, MarkSet.defaultMarkInfo, markInfo)));
    }
    removeMark(markName) {
        const index = this._children.findIndex((m => m.name === markName));
        index >= 0 && (this._infoMap.delete(this._children[index]), delete this._markNameMap[markName], 
        this._children.splice(index, 1));
    }
    clear() {
        this._children = [], this._markNameMap = {}, this._infoMap.clear();
    }
    forEach(callbackfn) {
        this._children.forEach(callbackfn);
    }
    includes(mark, fromIndex) {
        return this._children.includes(mark, fromIndex);
    }
    get(key) {
        return isNaN(Number(key)) ? this._markNameMap[key] : this._children[key];
    }
    getMarks() {
        return this._children.slice();
    }
    getMarksInType(type) {
        const types = (0, vutils_1.array)(type);
        return this._children.filter((m => types.includes(m.type)));
    }
    getMarkInId(markId) {
        return this._children.find((m => m.id === markId));
    }
    getMarkWithInfo(info) {
        return this._children.find((mark => Object.keys(info).every((key => info[key] === this._infoMap.get(mark)[key]))));
    }
}

exports.MarkSet = MarkSet, MarkSet.defaultMarkInfo = {};
//# sourceMappingURL=index.js.map
