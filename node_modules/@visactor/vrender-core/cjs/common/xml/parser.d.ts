import type { X2jOptions } from './type';
export declare class XMLParser {
    static defaultOptions: Partial<X2jOptions>;
    options: Partial<X2jOptions>;
    constructor(options?: Partial<X2jOptions>);
    valid(xml: string): boolean;
    parse(xmlData: string): any;
}
export declare function isSvg(str: string): boolean;
export declare function isXML(str: string): boolean;
