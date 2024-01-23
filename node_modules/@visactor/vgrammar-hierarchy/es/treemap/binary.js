export default function(parent, x0, y0, x1, y1) {
    const nodes = parent.children, n = nodes.length;
    let sum = 0;
    const sums = new Array(n + 1);
    sums[0] = 0;
    for (let i = 0; i < n; ++i) sum += nodes[i].value, sums[i + 1] = sum;
    const partition = (i, j, value, x0, y0, x1, y1) => {
        if (i >= j - 1) {
            const node = nodes[i];
            return node.x0 = x0, node.y0 = y0, node.x1 = x1, void (node.y1 = y1);
        }
        const valueOffset = sums[i], valueTarget = value / 2 + valueOffset;
        let k = i + 1, hi = j - 1;
        for (;k < hi; ) {
            const mid = k + hi >>> 1;
            sums[mid] < valueTarget ? k = mid + 1 : hi = mid;
        }
        valueTarget - sums[k - 1] < sums[k] - valueTarget && i + 1 < k && --k;
        const valueLeft = sums[k] - valueOffset, valueRight = value - valueLeft;
        if (x1 - x0 > y1 - y0) {
            const xk = value ? (x0 * valueRight + x1 * valueLeft) / value : x1;
            partition(i, k, valueLeft, x0, y0, xk, y1), partition(k, j, valueRight, xk, y0, x1, y1);
        } else {
            const yk = value ? (y0 * valueRight + y1 * valueLeft) / value : y1;
            partition(i, k, valueLeft, x0, y0, x1, yk), partition(k, j, valueRight, x0, yk, x1, y1);
        }
    };
    partition(0, n, parent.value, x0, y0, x1, y1);
}
//# sourceMappingURL=binary.js.map