export type LooseFunction = (...args: any) => any;
export type Dict<T> = {
    [key: string]: T;
};
export type Maybe<T> = T | null | undefined;
export interface ILogger {
    addErrorHandler: (handler: (...args: any[]) => void) => void;
    removeErrorHandler: (handler: (...args: any[]) => void) => void;
    canLogInfo: () => boolean;
    canLogDebug: () => boolean;
    canLogError: () => boolean;
    canLogWarn: () => boolean;
    level: (levelValue?: number) => this | number;
    error: (...args: any[]) => this;
    warn: (...args: any[]) => this;
    info: (...args: any[]) => this;
    debug: (...args: any[]) => this;
}
