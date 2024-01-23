import type { Parser } from '.';
export interface IDsvParserOptions {
    delimiter?: string;
}
export declare const dsvParser: Parser;
export declare const csvParser: Parser;
export declare const tsvParser: Parser;
