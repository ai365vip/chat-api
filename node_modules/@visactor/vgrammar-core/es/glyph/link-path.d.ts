import type { LinkPathEncoderSpec } from '../types';
export interface LinkPathConfig {
    direction?: 'horizontal' | 'vertical' | 'LR' | 'RL' | 'TB' | 'BL' | 'radial';
}
export declare const getHorizontalPath: (options: LinkPathEncoderSpec, ratio?: number) => string;
export declare const getVerticalPath: (options: LinkPathEncoderSpec, ratio?: number) => string;
export declare const registerLinkPathGlyph: () => void;
