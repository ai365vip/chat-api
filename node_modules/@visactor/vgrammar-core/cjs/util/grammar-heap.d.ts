type CompareFunc = (a: any, b: any) => number;
export declare class Heap {
    protected compare: CompareFunc;
    protected nodes: any[];
    constructor(compare: CompareFunc);
    size(): number;
    last(): any;
    validate(): boolean;
    push(node: any): any;
    remove(node: any): void;
    pop(): any;
    clear(): void;
}
export {};
