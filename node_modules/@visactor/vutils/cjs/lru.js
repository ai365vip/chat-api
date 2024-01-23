"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.LRU = void 0;

class LRU {
    constructor() {
        this.CLEAN_THRESHOLD = 1e3, this.L_TIME = 1e3, this.R_COUNT = 1, this.R_TIMESTAMP_MAX_SIZE = 20;
    }
    clearCache(cache, params) {
        const {CLEAN_THRESHOLD: CLEAN_THRESHOLD = this.CLEAN_THRESHOLD, L_TIME: L_TIME = this.L_TIME, R_COUNT: R_COUNT = this.R_COUNT} = params;
        if (cache.size < CLEAN_THRESHOLD) return 0;
        let clearNum = 0;
        const clear = key => {
            clearNum++, cache.delete(key);
        }, now = Date.now();
        return cache.forEach(((item, key) => {
            if (item.timestamp.length < R_COUNT) return clear(key);
            let useCount = 0;
            for (;now - item.timestamp[item.timestamp.length - 1 - useCount] < L_TIME && (useCount++, 
            !(useCount >= R_COUNT)); ) ;
            if (useCount < R_COUNT) return clear(key);
            for (;now - item.timestamp[0] > L_TIME; ) item.timestamp.shift();
        })), clearNum;
    }
    addLimitedTimestamp(cacheItem, t, params) {
        const {R_TIMESTAMP_MAX_SIZE: R_TIMESTAMP_MAX_SIZE = this.R_TIMESTAMP_MAX_SIZE} = params;
        cacheItem.timestamp.length > R_TIMESTAMP_MAX_SIZE && cacheItem.timestamp.shift(), 
        cacheItem.timestamp.push(t);
    }
    clearTimeStamp(cache, params) {
        const {L_TIME: L_TIME = this.L_TIME} = params, now = Date.now();
        cache.forEach((item => {
            for (;now - item.timestamp[0] > L_TIME; ) item.timestamp.shift();
        }));
    }
    clearItemTimestamp(cacheItem, params) {
        const {L_TIME: L_TIME = this.L_TIME} = params, now = Date.now();
        for (;now - cacheItem.timestamp[0] > L_TIME; ) cacheItem.timestamp.shift();
    }
}

exports.LRU = LRU;
//# sourceMappingURL=lru.js.map