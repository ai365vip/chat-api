import type { Nil } from './base';
import type { IGlyphElement } from './element';
import type { MarkType } from './mark';
export interface IGlyphMeta<EncodeValuesType = any, GlyphConfigType = any> {
    getMarks: () => {
        [markName: string]: MarkType;
    };
    getChannelEncoder: () => {
        [channel: string]: GlyphChannelEncoder<any, EncodeValuesType, GlyphConfigType>;
    };
    getDefaultEncoder: () => GlyphDefaultEncoder<GlyphConfigType>;
    getFunctionEncoder: () => GlyphFunctionEncoder<GlyphConfigType>;
    getProgressiveChannels: () => string[];
    registerChannelEncoder: ((encoders: {
        [markName: string]: GlyphChannelEncoder<any, EncodeValuesType, GlyphConfigType>;
    }) => this) & ((channel: string, encoder: GlyphChannelEncoder<any, EncodeValuesType, GlyphConfigType>) => this);
    registerDefaultEncoder: (encoder: GlyphDefaultEncoder<GlyphConfigType>) => this;
    registerFunctionEncoder: (encoder: GlyphFunctionEncoder<GlyphConfigType>) => this;
    registerProgressiveChannels: (channels: string | string[]) => this;
}
export type GlyphChannelEncoder<EncodeValueType = any, EncodeValuesType = any, GlyphConfigType = any> = (channel: string, encodeValue: EncodeValueType, encodeValues: EncodeValuesType, datum: any, element: IGlyphElement, glyphConfig: GlyphConfigType) => {
    [markName: string]: any;
} | Nil;
export type GlyphDefaultEncoder<GlyphConfigType = any> = (datum: any, element: IGlyphElement, glyphConfig: GlyphConfigType) => {
    [markName: string]: any;
};
export type GlyphFunctionEncoder<GlyphConfigType = any> = (encodeValues: any, datum: any, element: IGlyphElement, glyphConfig: GlyphConfigType) => {
    [markName: string]: any;
} | Nil;
