import { maxInArray, minInArray } from "@visactor/vutils";

import { average, sum } from "../util/util";

const samplerMap = {
    min: minInArray,
    max: maxInArray,
    average: average,
    sum: sum
};

function lttb(size, array, isGroup, yfield) {
    const frameSize = Math.floor(array.length / size), newIndices = [], len = array.length;
    let maxArea, area, nextIndex, currentIndex = 0, sampledIndex = 0;
    newIndices[sampledIndex++] = currentIndex;
    for (let i = 1; i < len - 1; i += frameSize) {
        const nextFrameStart = Math.min(i + frameSize, len - 1), nextFrameEnd = Math.min(i + 2 * frameSize, len), avgX = (nextFrameEnd + nextFrameStart) / 2;
        let avgY = 0;
        for (let idx = nextFrameStart; idx < nextFrameEnd; idx++) {
            const value = array[idx][yfield];
            Number.isNaN(value) || (avgY += value);
        }
        avgY /= nextFrameEnd - nextFrameStart;
        const frameStart = i, frameEnd = Math.min(i + frameSize, len), pointAX = i - 1, pointAY = array[currentIndex][yfield];
        maxArea = -1, nextIndex = frameStart;
        for (let idx = frameStart; idx < frameEnd; idx++) {
            const value = array[idx][yfield];
            Number.isNaN(yfield) || (area = Math.abs((pointAX - avgX) * (value - pointAY) - (pointAX - idx) * (avgY - pointAY)), 
            area > maxArea && (maxArea = area, nextIndex = idx));
        }
        newIndices[sampledIndex++] = nextIndex, currentIndex = nextIndex;
    }
    newIndices[sampledIndex - 1] !== len - 1 && (newIndices[sampledIndex++] = len - 1);
    return newIndices.map((i => isGroup ? array[i].i : i));
}

function sample(size, array, isGroup, mode, yfield) {
    let frameSize = Math.floor(array.length / size);
    const newIndices = [], len = array.length;
    let sampledIndex = 0, frameValues = [];
    newIndices.push(sampledIndex), array[sampledIndex][yfield] = array[sampledIndex][yfield];
    for (let i = 1; i < len - 1; i += frameSize) {
        frameSize > len - i && (frameSize = len - i, frameValues.length = frameSize), frameValues = [];
        for (let k = 0; k < frameSize; k++) frameValues.push(array[i + k][yfield]);
        const value = samplerMap[mode](frameValues);
        sampledIndex = Math.min(Math.round(i + frameValues.length / 2) || 0, len - 1), array[sampledIndex][yfield] = value, 
        newIndices.push(sampledIndex);
    }
    return newIndices.map((i => isGroup ? array[i].i : i));
}

function sampleMin(size, array, isGroup, yfield) {
    return sample(size, array, isGroup, "min", yfield);
}

function sampleMax(size, array, isGroup, yfield) {
    return sample(size, array, isGroup, "max", yfield);
}

function sampleAverage(size, array, isGroup, yfield) {
    return sample(size, array, isGroup, "average", yfield);
}

function sampleSum(size, array, isGroup, yfield) {
    return sample(size, array, isGroup, "sum", yfield);
}

export const transform = (options, upstreamData) => {
    let size = options.size;
    const factor = options.factor || 1;
    if (Array.isArray(size) && (size = Math.floor(size[1] - size[0])), size *= factor, 
    size <= 0) return [];
    if (upstreamData.length <= size) return upstreamData;
    if (options.skipfirst) return upstreamData.slice(0, 1);
    const {mode: mode, yfield: y, groupBy: groupBy} = options, yfield = null != y ? y : "y";
    let sampler = lttb;
    if ("min" === mode ? sampler = sampleMin : "max" === mode ? sampler = sampleMax : "average" === mode ? sampler = sampleAverage : "sum" === mode && (sampler = sampleSum), 
    upstreamData.length) {
        const groups = {};
        if (groupBy) {
            for (let i = 0, n = upstreamData.length; i < n; i++) {
                const datum = upstreamData[i], groupId = datum[groupBy];
                groups[groupId] ? groups[groupId].push({
                    [yfield]: datum[yfield],
                    i: i
                }) : (groups[groupId] = [], groups[groupId].push({
                    [yfield]: datum[yfield],
                    i: i
                }));
            }
            let rawIndice = [];
            return Object.keys(groups).forEach((groupName => {
                const group = groups[groupName];
                if (group.length <= size) {
                    const indices = group.map((datum => datum.i));
                    rawIndice = rawIndice.concat(indices);
                } else {
                    const indices = sampler(size, group, !0, yfield);
                    rawIndice = rawIndice.concat(indices), group.forEach((datum => upstreamData[datum.i][yfield] = datum[yfield]));
                }
            })), rawIndice.sort(((a, b) => a - b)), rawIndice.map((index => upstreamData[index]));
        }
        return sampler(size, upstreamData, !1, yfield).map((index => upstreamData[index]));
    }
    return [];
};
//# sourceMappingURL=sampling.js.map
