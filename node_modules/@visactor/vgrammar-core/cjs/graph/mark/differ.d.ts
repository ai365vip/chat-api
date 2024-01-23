import type { DiffResult } from '../../types/base';
export type GroupedData<T> = {
    keys: (symbol | string)[];
    data: Map<symbol | string, T[]>;
};
export declare function groupData<T>(data: T[], key: ((datum: T) => symbol | string) | string, sort?: (a: T, b: T) => number): GroupedData<T>;
export declare class Differ<T> {
    private prevData;
    private currentData;
    private callback;
    constructor(data?: T[], key?: ((datum: T) => symbol | string) | string, sort?: (a: T, b: T) => number);
    setCurrentData(currentData: GroupedData<T>): void;
    getCurrentData(): GroupedData<T>;
    doDiff(): void;
    setCallback(callback: (key: symbol | string, data: T[], prevData: T[]) => void): void;
    updateToCurrent(): void;
    reset(): void;
}
export declare function diffSingle<U, V>(prev: U[], next: V[], key: (datum: U | V) => symbol | string): DiffResult<U, V>;
export declare function diffMultiple<U, V>(prev: U[], next: V[], key: (datum: U | V) => symbol | string): DiffResult<U[], V[]>;
