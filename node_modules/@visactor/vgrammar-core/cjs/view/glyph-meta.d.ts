import type { GlyphDefaultEncoder, IGlyphMeta, GlyphChannelEncoder, MarkType, GlyphFunctionEncoder } from '../types';
export declare class GlyphMeta<EncodeValuesType = any, GlyphConfigType = any> implements IGlyphMeta<EncodeValuesType, GlyphConfigType> {
    private marks;
    private channelEncoder;
    private defaultEncoder;
    private functionEncoder;
    private progressiveChannels;
    constructor(marks: {
        [markName: string]: MarkType;
    }, encoders?: {
        [markName: string]: GlyphChannelEncoder<any, EncodeValuesType, GlyphConfigType>;
    }, defaultEncoder?: GlyphDefaultEncoder<GlyphConfigType>, progressiveChannels?: string | string[]);
    getMarks(): {
        [markName: string]: string;
    };
    registerChannelEncoder(encoders: {
        [markName: string]: GlyphChannelEncoder<any, EncodeValuesType, GlyphConfigType>;
    }): this;
    registerChannelEncoder(channel: string, encoder: GlyphChannelEncoder<any, EncodeValuesType, GlyphConfigType>): this;
    registerFunctionEncoder(encoder: GlyphFunctionEncoder<GlyphConfigType>): this;
    registerDefaultEncoder(encoder: GlyphDefaultEncoder<GlyphConfigType>): this;
    registerProgressiveChannels(channels: string | string[]): this;
    getChannelEncoder(): {
        [channel: string]: GlyphChannelEncoder<any, EncodeValuesType, GlyphConfigType>;
    };
    getFunctionEncoder(): GlyphFunctionEncoder<GlyphConfigType>;
    getDefaultEncoder(): GlyphDefaultEncoder<GlyphConfigType>;
    getProgressiveChannels(): string[];
}
