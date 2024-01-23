import { identity } from "@visactor/vgrammar-util";

export class UniqueList {
    constructor(idFunc) {
        this.list = [], this.ids = {}, this.idFunc = idFunc || identity;
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
//# sourceMappingURL=unique-list.js.map
