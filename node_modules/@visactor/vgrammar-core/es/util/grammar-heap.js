function moveToHead(array, idx, start, cmp) {
    let parent, pidx;
    const item = array[idx];
    for (;idx > start && (pidx = Math.floor((idx - 1) / 2), parent = array[pidx], item && parent && cmp(item, parent) < 0); ) array[idx] = parent, 
    idx = pidx;
    return array[idx] = item;
}

function moveToTail(array, idx, end, cmp) {
    const start = idx, endIdx = null != end ? end : array.length, item = array[idx];
    let ridx, cidx = 2 * idx + 1;
    for (;cidx < endIdx; ) ridx = cidx + 1, ridx < endIdx && cmp(array[cidx], array[ridx]) >= 0 && (cidx = ridx), 
    array[idx] = array[cidx], cidx = 2 * (idx = cidx) + 1;
    return array[idx] = item, moveToHead(array, idx, start, cmp);
}

export class Heap {
    constructor(compare) {
        this.compare = compare, this.nodes = [];
    }
    size() {
        return this.nodes.length;
    }
    last() {
        return this.nodes[0];
    }
    validate() {
        for (let i = this.nodes.length - 1; i > 0; i -= 1) {
            const parentIndex = Math.floor((i - 1) / 2);
            if (this.compare(this.nodes[parentIndex], this.nodes[i]) > 0) return !1;
        }
        return !0;
    }
    push(node) {
        if (this.nodes.includes(node)) {
            const index = this.nodes.indexOf(node);
            return moveToHead(this.nodes, index, 0, this.compare), moveToTail(this.nodes, index, null, this.compare);
        }
        return this.nodes.push(node), moveToHead(this.nodes, this.nodes.length - 1, 0, this.compare);
    }
    remove(node) {
        if (this.nodes.includes(node)) {
            const index = this.nodes.indexOf(node);
            this.nodes = this.nodes.slice(0, index).concat(this.nodes.slice(index + 1)), moveToHead(this.nodes, index, 0, this.compare), 
            moveToTail(this.nodes, index, null, this.compare);
        }
    }
    pop() {
        const last = this.nodes.pop();
        let item;
        return this.nodes.length ? (item = this.nodes[0], this.nodes[0] = last, moveToTail(this.nodes, 0, null, this.compare)) : item = last, 
        item;
    }
    clear() {
        this.nodes = [];
    }
}
//# sourceMappingURL=grammar-heap.js.map
