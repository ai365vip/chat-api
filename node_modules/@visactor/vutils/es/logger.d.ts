import type { ILogger } from './type';
export declare enum LoggerLevel {
    None = 0,
    Error = 1,
    Warn = 2,
    Info = 3,
    Debug = 4
}
type ErrorHandler = (...args: any[]) => void;
export declare class Logger implements ILogger {
    private static _instance;
    static getInstance(level?: number, method?: string): ILogger;
    static setInstance(logger: ILogger): ILogger;
    static setInstanceLevel(level: number): void;
    static clearInstance(): void;
    private _level;
    private _method;
    private _onErrorHandler;
    constructor(level?: number, method?: string);
    addErrorHandler(handler: ErrorHandler): void;
    removeErrorHandler(handler: ErrorHandler): void;
    callErrorHandler(...args: any[]): void;
    canLogInfo(): boolean;
    canLogDebug(): boolean;
    canLogError(): boolean;
    canLogWarn(): boolean;
    level(): number;
    level(levelValue: number): this;
    error(...args: any[]): this;
    warn(...args: any[]): this;
    info(...args: any[]): this;
    debug(...args: any[]): this;
}
export {};
