export declare class UniqueList<T> {
    private idFunc;
    private list;
    private ids;
    constructor(idFunc: (val: T) => number);
    add(element: T): this;
    remove(element: T): this;
    forEach(callback: (entry: T, index?: number, arr?: T[]) => void, reverse?: boolean): void;
    filter(callback: (entry: T, index?: number, arr?: T[]) => boolean): T[];
    get length(): number;
    getElementByIndex(index: number): T;
}
