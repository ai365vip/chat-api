import type { Parser } from '..';
import type { IGeoJSONOptions } from './geojson';
export interface ITopoJsonParserOptions extends IGeoJSONOptions {
    object: string;
}
export declare const topoJSONParser: Parser;
