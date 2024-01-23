import type { ILogger } from '@visactor/vutils';
import { Logger } from '@visactor/vutils';
import type { DataView } from './data-view';
import type { Transform } from './transform';
import type { IParserOptions, Parser } from './parser';
interface IDataSetOptions {
    name?: string;
    logger?: Logger;
}
export declare class DataSet {
    options?: IDataSetOptions;
    isDataSet: boolean;
    transformMap: Record<string, any>;
    parserMap: Record<string, any>;
    dataViewMap: Record<string | number, DataView>;
    name: string;
    target: any;
    _callMap: Map<Function, (...args: any[]) => void>;
    protected _logger: ILogger;
    constructor(options?: IDataSetOptions);
    setLogger(logger: Logger): void;
    getDataView(name: string | number): DataView;
    setDataView(name: string | number, dataView: DataView): void;
    removeDataView(name: string | number): void;
    registerParser(name: string, parser: Parser): void;
    removeParser(name: string): void;
    getParser(name: string): Parser;
    registerTransform(name: string, transform: Transform): void;
    removeTransform(name: string): void;
    getTransform(name?: string): Transform;
    multipleDataViewAddListener(list: DataView[], event: string, call: Function): void;
    allDataViewAddListener(event: string, call: () => void): void;
    multipleDataViewRemoveListener(list: DataView[], event: string, call: Function): void;
    multipleDataViewUpdateInParse(newData: {
        name: string;
        data: any;
        options?: IParserOptions;
    }[]): void;
    multipleDataViewUpdateInRawData(newData: {
        name: string;
        data: any;
        options?: IParserOptions;
    }[]): void;
    destroy(): void;
}
export {};
