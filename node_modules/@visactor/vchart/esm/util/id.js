let VChartId = 0;

const VChartIdMax = 9999999;

export function createID() {
    return VChartId >= 9999999 && (VChartId = 0), VChartId++;
}

export function resetID() {
    VChartId = 0;
}
//# sourceMappingURL=id.js.map
