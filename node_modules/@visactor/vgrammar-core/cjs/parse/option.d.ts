import type { IGrammarBase } from '../types';
export declare const parseOptionValue: (value: IGrammarBase | any, params: any) => any;
export declare const parseOptions: (options: Record<string, IGrammarBase | any> | Array<IGrammarBase | any>, params: any) => Record<string, any>;
