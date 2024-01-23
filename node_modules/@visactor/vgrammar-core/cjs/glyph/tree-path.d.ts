import type { TreePathEncoderSpec } from '../types';
export interface TreePathConfig {
    direction?: 'horizontal' | 'vertical' | 'LR' | 'RL' | 'TB' | 'BL' | 'radial';
}
export declare const getHorizontalPath: (options: TreePathEncoderSpec) => string[];
export declare const getVerticalPath: (options: TreePathEncoderSpec) => string[];
export declare const registerTreePathGlyph: () => void;
