const DIV = 5, MOD = 31, SIZE = 32, RIGHT0 = new Uint32Array(33), RIGHT1 = new Uint32Array(33);

RIGHT1[0] = 0, RIGHT0[0] = ~RIGHT1[0];

for (let i = 1; i <= 32; ++i) RIGHT1[i] = RIGHT1[i - 1] << 1 | 1, RIGHT0[i] = ~RIGHT1[i];

export function bitmap(w, h) {
    const array = new Uint32Array(~~((w * h + 32) / 32));
    function _set(index, mask) {
        array[index] |= mask;
    }
    function _clear(index, mask) {
        array[index] &= mask;
    }
    return {
        array: array,
        get: (x, y) => {
            const index = y * w + x;
            return array[index >>> 5] & 1 << (31 & index);
        },
        set: (x, y) => {
            const index = y * w + x;
            _set(index >>> 5, 1 << (31 & index));
        },
        clear: (x, y) => {
            const index = y * w + x;
            _clear(index >>> 5, ~(1 << (31 & index)));
        },
        getRange: ({x1: x1, y1: y1, x2: x2, y2: y2}) => {
            if (x2 < 0 || y2 < 0 || x1 > w || y1 > h) return !0;
            let start, end, indexStart, indexEnd, r = y2;
            for (;r >= y1; --r) if (start = r * w + x1, end = r * w + x2, indexStart = start >>> 5, 
            indexEnd = end >>> 5, indexStart === indexEnd) {
                if (array[indexStart] & RIGHT0[31 & start] & RIGHT1[1 + (31 & end)]) return !0;
            } else {
                if (array[indexStart] & RIGHT0[31 & start]) return !0;
                if (array[indexEnd] & RIGHT1[1 + (31 & end)]) return !0;
                for (let i = indexStart + 1; i < indexEnd; ++i) if (array[i]) return !0;
            }
            return !1;
        },
        setRange: ({x1: x1, y1: y1, x2: x2, y2: y2}) => {
            if (x2 < 0 || y2 < 0 || x1 > w || y1 > h) return;
            let start, end, indexStart, indexEnd, i;
            for (;y1 <= y2; ++y1) if (start = y1 * w + x1, end = y1 * w + x2, indexStart = start >>> 5, 
            indexEnd = end >>> 5, indexStart === indexEnd) _set(indexStart, RIGHT0[31 & start] & RIGHT1[1 + (31 & end)]); else for (_set(indexStart, RIGHT0[31 & start]), 
            _set(indexEnd, RIGHT1[1 + (31 & end)]), i = indexStart + 1; i < indexEnd; ++i) _set(i, 4294967295);
        },
        clearRange: ({x1: x1, y1: y1, x2: x2, y2: y2}) => {
            let start, end, indexStart, indexEnd, i;
            for (;y1 <= y2; ++y1) if (start = y1 * w + x1, end = y1 * w + x2, indexStart = start >>> 5, 
            indexEnd = end >>> 5, indexStart === indexEnd) _clear(indexStart, RIGHT1[31 & start] | RIGHT0[1 + (31 & end)]); else for (_clear(indexStart, RIGHT1[31 & start]), 
            _clear(indexEnd, RIGHT0[1 + (31 & end)]), i = indexStart + 1; i < indexEnd; ++i) _clear(i, 0);
        },
        outOfBounds: ({x1: x1, y1: y1, x2: x2, y2: y2}) => x1 < 0 || y1 < 0 || y2 >= h || x2 >= w,
        toImageData: ctx => {
            const imageData = ctx.createImageData(w, h), data = imageData.data;
            for (let y = 0; y < h; ++y) for (let x = 0; x < w; ++x) {
                const index = y * w + x, offset = 4 * index, occupied = array[index >>> 5] & 1 << (31 & index);
                data[offset + 0] = 255 * occupied, data[offset + 1] = 255 * occupied, data[offset + 2] = 255 * occupied, 
                data[offset + 3] = 31;
            }
            return imageData;
        }
    };
}
//# sourceMappingURL=bitmap.js.map
