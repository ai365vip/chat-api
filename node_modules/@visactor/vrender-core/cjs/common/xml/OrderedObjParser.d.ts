import type { X2jOptions } from './type';
declare class XmlNode {
    tagname: string;
    child: any[];
    constructor(tagname: string);
    add(key: string, val: string): void;
    addChild(node: XmlNode): void;
}
export declare class OrderedObjParser {
    options: Partial<X2jOptions>;
    currentNode: XmlNode | null;
    tagsNodeStack: XmlNode[];
    docTypeEntities: Record<string, any>;
    constructor(options: Partial<X2jOptions>);
    protected addChild(currentNode: XmlNode, childNode: XmlNode, jPath: string): void;
    protected buildAttributesMap(attrStr: string, jPath: string, tagName: string): {};
    parseXml(xmlData: string): any[];
}
export {};
