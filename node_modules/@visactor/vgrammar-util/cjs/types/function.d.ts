export type FieldGetterFunction = (val: any) => any;
export type Getter = (path: string[]) => FieldGetterFunction;
export interface FieldGetterGeneratorOptions {
    get?: Getter;
}
export type ParameterFieldEntry = string | FieldGetterFunction;
export type ParameterFields = ParameterFieldEntry[] | ParameterFieldEntry;
export type ReturnNumberFunction = (val: any) => number;
export type NumberTransformFunction = (val: number) => number;
export type ReturnBooleanFunction = (val: any) => boolean;
export type CompareFunction = (a: any, b: any) => number;
