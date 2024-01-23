"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.defaultTicker = void 0;

const default_ticker_1 = require("./Ticker/default-ticker"), timeline_1 = require("./timeline");

exports.defaultTicker = new default_ticker_1.DefaultTicker, exports.defaultTicker.addTimeline(timeline_1.defaultTimeline);

const TICKER_FPS = 60;

exports.defaultTicker.setFPS(60);
//# sourceMappingURL=default-ticker.js.map