"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.theme = exports.DEFAULT_THEME = void 0;

const vutils_1 = require("@visactor/vutils");

exports.DEFAULT_THEME = {
    visible: !0,
    position: "auto",
    titleStyle: {
        fontSize: 16,
        fill: "#08979c"
    },
    contentStyle: {
        fontSize: 12,
        fill: "green"
    },
    panel: {
        visible: !0,
        fill: "#e6fffb",
        size: 12,
        space: 0,
        stroke: "#87e8de",
        lineWidth: 1,
        cornerRadius: 4
    }
}, exports.theme = {
    poptip: (0, vutils_1.merge)({}, exports.DEFAULT_THEME)
};
//# sourceMappingURL=theme.js.map
