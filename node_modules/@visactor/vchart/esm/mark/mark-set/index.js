import { array, isNil, merge } from "@visactor/vutils";

export class MarkSet {
    constructor() {
        this._children = [], this._markNameMap = {}, this._infoMap = new Map;
    }
    getMarkNameMap() {
        return this._markNameMap;
    }
    addMark(mark, markInfo) {
        isNil(mark) || (this._children.push(mark), this._markNameMap[mark.name] = mark, 
        this._infoMap.set(mark, merge({}, MarkSet.defaultMarkInfo, markInfo)));
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
        const types = array(type);
        return this._children.filter((m => types.includes(m.type)));
    }
    getMarkInId(markId) {
        return this._children.find((m => m.id === markId));
    }
    getMarkWithInfo(info) {
        return this._children.find((mark => Object.keys(info).every((key => info[key] === this._infoMap.get(mark)[key]))));
    }
}

MarkSet.defaultMarkInfo = {};
//# sourceMappingURL=index.js.map
