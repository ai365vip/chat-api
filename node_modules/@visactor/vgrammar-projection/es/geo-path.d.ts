import type { GeoProjection } from 'd3-geo';
export declare const transform: (options: {
    field?: string;
    as?: string;
    projection?: GeoProjection;
    pointRadius?: number;
}, upstreamData: any[]) => any[];
