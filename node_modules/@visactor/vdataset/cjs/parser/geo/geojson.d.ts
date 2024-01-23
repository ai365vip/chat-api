import type { Parser } from '..';
export interface IGeoJSONOptions {
    centroid?: boolean;
    name?: boolean;
    bbox?: boolean;
    rewind?: boolean | {
        reverse?: boolean;
    };
}
export declare const DEFAULT_GEOJSON_OPTIONS: {
    centroid: boolean;
    name: boolean;
    bbox: boolean;
    rewind: boolean;
};
export declare const MultiToSingle: (feature: any) => any;
export declare const flattenFeature: (data: any[]) => any[];
export declare const geoJSONParser: Parser;
