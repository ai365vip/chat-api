export type Transform = (data: any, options?: any) => any;
type TransformName = string;
export interface ITransformOptions {
    type: TransformName;
    options?: any;
    level?: number;
}
export {};
