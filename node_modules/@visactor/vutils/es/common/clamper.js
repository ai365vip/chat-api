export function clamper(a, b) {
    let t;
    return a > b && (t = a, a = b, b = t), x => Math.max(a, Math.min(b, x));
}
//# sourceMappingURL=clamper.js.map