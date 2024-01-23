export declare function array<T>(arr?: T | T[]): T[];
export declare function last<T>(val: T | T[]): T | undefined;
export declare const span: (arr: number[]) => number;
export declare const maxInArray: <T>(arr: T[], compareFn?: (a: T, b: T) => number) => T;
export declare const minInArray: <T>(arr: T[], compareFn?: (a: T, b: T) => number) => T;
export declare function arrayEqual(a: any, b: any): boolean;
export declare function uniqArray<T>(arr: T | T[]): T | T[];
export declare function shuffleArray<T>(arr: T[], random?: () => number): T[];
export declare function flattenArray(arr: any): any[];
