import { array, isString } from "@visactor/vutils";

export class GlyphMeta {
    constructor(marks, encoders, defaultEncoder, progressiveChannels) {
        this.channelEncoder = {}, this.marks = marks, encoders && this.registerChannelEncoder(encoders), 
        defaultEncoder && this.registerDefaultEncoder(defaultEncoder), this.progressiveChannels && this.registerProgressiveChannels(progressiveChannels);
    }
    getMarks() {
        return this.marks;
    }
    registerChannelEncoder(channel, encoder) {
        return isString(channel) ? this.channelEncoder[channel] = encoder : Object.assign(this.channelEncoder, channel), 
        this;
    }
    registerFunctionEncoder(encoder) {
        return this.functionEncoder = encoder, this;
    }
    registerDefaultEncoder(encoder) {
        return this.defaultEncoder = encoder, this;
    }
    registerProgressiveChannels(channels) {
        return this.progressiveChannels = array(channels), this;
    }
    getChannelEncoder() {
        return this.channelEncoder;
    }
    getFunctionEncoder() {
        return this.functionEncoder;
    }
    getDefaultEncoder() {
        return this.defaultEncoder;
    }
    getProgressiveChannels() {
        return this.progressiveChannels;
    }
}
//# sourceMappingURL=glyph-meta.js.map
