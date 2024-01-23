"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.parseUint8ToImageData = void 0;

const parseUint8ToImageData = (buffer, width, height) => {
    const clampBuffer = new Uint8ClampedArray(buffer), flipClampBuffer = new Uint8ClampedArray(buffer.length);
    for (let i = height - 1; i >= 0; i--) for (let j = 0; j < width; j++) {
        const sourceIdx = i * width * 4 + 4 * j, targetIdx = (height - i) * width * 4 + 4 * j;
        flipClampBuffer[targetIdx] = clampBuffer[sourceIdx], flipClampBuffer[targetIdx + 1] = clampBuffer[sourceIdx + 1], 
        flipClampBuffer[targetIdx + 2] = clampBuffer[sourceIdx + 2], flipClampBuffer[targetIdx + 3] = clampBuffer[sourceIdx + 3];
    }
    return new ImageData(flipClampBuffer, width, height);
};

exports.parseUint8ToImageData = parseUint8ToImageData;
//# sourceMappingURL=image.js.map
