import type { Parser } from '.';
export interface ITreeParserOptions {
    children?: (data: any) => any[];
    pureData?: boolean;
}
export declare const treeParser: Parser;
