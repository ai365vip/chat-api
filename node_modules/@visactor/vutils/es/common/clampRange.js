const clampRange = (range, min, max) => {
    let [lowValue, highValue] = range;
    highValue < lowValue && (lowValue = range[1], highValue = range[0]);
    const span = highValue - lowValue;
    return span >= max - min ? [ min, max ] : (lowValue = Math.min(Math.max(lowValue, min), max - span), 
    [ lowValue, lowValue + span ]);
};

export default clampRange;
//# sourceMappingURL=clampRange.js.map