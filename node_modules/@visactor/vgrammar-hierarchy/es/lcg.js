const a = 1664525, c = 1013904223, m = 4294967296;

export function randomLCG(initS = 1) {
    let s = initS;
    return () => (s = (a * s + c) % m) / m;
}
//# sourceMappingURL=lcg.js.map