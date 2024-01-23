import type { LooseFunction } from '../type';
export declare class HashValue<T> {
    index: number;
    key: string;
    value: T;
}
export declare class HashTable<T> {
    private items;
    private itemList;
    constructor();
    get type(): string;
    set(key: string, value: T): HashValue<T>;
    clear(): void;
    del(key: string): void;
    delFrom(index: number): void;
    resetIndex(): void;
    has(key: string): boolean;
    get(key: string): T | null;
    count(): number;
    all(): Array<T>;
    first(): T;
    last(): T;
    getByIndex(index: number): T;
    getKeyByIndex(index: number): string;
    foreach(callback: (key: string, value: T) => boolean | void): boolean;
    private foreachHashv;
    hasValue(value: any): boolean;
    indexOf(key: any): number;
    insertAt(index: number, value: T, key: string): void;
    sort(callback: LooseFunction): HashValue<T>[];
    toArray(): Array<T>;
    push(lists: HashTable<any>): void;
    mapKey(): string[];
    toImmutableMap(): void;
}
