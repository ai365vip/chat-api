import type { IGrammarBase, IView, MarkFunctionType, ScaleEncodeType, FieldEncodeType } from '../types';
export declare function isScaleEncode(encode: any): encode is ScaleEncodeType;
export declare function isFieldEncode(encode: any): encode is FieldEncodeType;
export declare function parseEncodeType(encoder: MarkFunctionType<any> | ScaleEncodeType, view: IView): IGrammarBase[];
