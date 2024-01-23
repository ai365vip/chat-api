interface Threshold {
    CLEAN_THRESHOLD?: number;
    L_TIME?: number;
    R_COUNT?: number;
    R_TIMESTAMP_MAX_SIZE?: number;
}
export declare class LRU {
    private CLEAN_THRESHOLD;
    private L_TIME;
    private R_COUNT;
    private R_TIMESTAMP_MAX_SIZE;
    clearCache<TK, TV extends {
        timestamp: number[];
    }>(cache: Map<TK, TV>, params: Threshold): number;
    addLimitedTimestamp<T extends {
        timestamp: number[];
    }>(cacheItem: T, t: number, params: Threshold): void;
    clearTimeStamp<TK, TV extends {
        timestamp: number[];
    }>(cache: Map<TK, TV>, params: Threshold): void;
    clearItemTimestamp<T extends {
        timestamp: number[];
    }>(cacheItem: T, params: Threshold): void;
}
export {};
