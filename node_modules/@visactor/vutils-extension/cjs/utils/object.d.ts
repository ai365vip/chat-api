export declare const includeSpec: <T = any>(spec: Partial<T>, searchSpec: Partial<T>) => boolean;
export declare const setProperty: <T>(target: T, path: Array<string | number>, value: any) => T;
export declare const getProperty: <T>(target: any, path: Array<string | number>, defaultValue?: T) => T;
