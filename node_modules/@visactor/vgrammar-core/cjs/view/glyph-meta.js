"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.GlyphMeta = void 0;

const vutils_1 = require("@visactor/vutils");

class GlyphMeta {
    constructor(marks, encoders, defaultEncoder, progressiveChannels) {
        this.channelEncoder = {}, this.marks = marks, encoders && this.registerChannelEncoder(encoders), 
        defaultEncoder && this.registerDefaultEncoder(defaultEncoder), this.progressiveChannels && this.registerProgressiveChannels(progressiveChannels);
    }
    getMarks() {
        return this.marks;
    }
    registerChannelEncoder(channel, encoder) {
        return (0, vutils_1.isString)(channel) ? this.channelEncoder[channel] = encoder : Object.assign(this.channelEncoder, channel), 
        this;
    }
    registerFunctionEncoder(encoder) {
        return this.functionEncoder = encoder, this;
    }
    registerDefaultEncoder(encoder) {
        return this.defaultEncoder = encoder, this;
    }
    registerProgressiveChannels(channels) {
        return this.progressiveChannels = (0, vutils_1.array)(channels), this;
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

exports.GlyphMeta = GlyphMeta;
//# sourceMappingURL=glyph-meta.js.map
