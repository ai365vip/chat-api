export declare function isStackOverflowExeption(error: unknown): error is RangeError;
export declare const tryAndThrowErrorIfStackOverflow: <T>(fn: () => T, errorCallback: () => Error) => T;
