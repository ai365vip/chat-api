import type { GrammarSpec, IData } from './grammar';
import type { GenericFunctionType, ParameterFunctionType } from './signal';
import type { TransformSpec } from './transform';
export type Datum = any;
export type DataFunctionCallback<T> = (datum: any, parameters: any) => T;
export type DataFunctionType<T> = GenericFunctionType<DataFunctionCallback<T>, T>;
export type DataType = 'boolean' | 'number' | 'date' | 'string';
export type DataParseSpec = 'auto' | {
    [f: string]: DataType | string;
};
export interface FormatJSONSpec {
    type: 'json';
    parse?: DataParseSpec;
    property?: string;
    copy?: boolean;
}
export interface FormatSVSpec {
    type: 'csv' | 'tsv';
    header?: string[];
    parse?: DataParseSpec;
}
export interface FormatDSVSpec {
    type: 'dsv';
    header?: string[];
    parse?: DataParseSpec;
    delimiter: string;
}
export type FormatTopoJSONSpec = {
    type: 'topojson';
    property?: string;
} & ({
    feature: string;
} | {
    mesh: string;
    filter: 'interior' | 'exterior' | null;
});
export type DataFormatSpec = FormatJSONSpec | FormatSVSpec | FormatDSVSpec;
export interface IDataFilter {
    source?: string;
    rank?: number;
    filter: (data: Datum[], parameters?: any) => Datum[];
}
export interface DataSpec extends GrammarSpec {
    name?: string;
    transform?: TransformSpec[];
    values?: Datum[];
    url?: ParameterFunctionType<string>;
    source?: string | string[] | IData | IData[];
    format?: ParameterFunctionType<DataFormatSpec>;
}
export type SortOrderType = 'desc' | 'asc';
export interface SortConfigSpec {
    field: string | string[];
    order?: SortOrderType | SortOrderType[];
}
