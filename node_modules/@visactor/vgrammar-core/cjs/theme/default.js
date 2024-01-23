"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.defaultTheme = void 0;

const component_1 = require("./common/component"), constants_1 = require("./common/constants"), mark_1 = require("./common/mark");

exports.defaultTheme = {
    name: "default",
    padding: constants_1.DEFAULT_PADDING,
    palette: {
        default: [ "#6690F2", "#70D6A3", "#B4E6E2", "#63B5FC", "#FF8F62", "#FFDC83", "#BCC5FD", "#A29BFE", "#63C4C7", "#F68484" ]
    },
    marks: mark_1.defaultMarkTheme,
    components: component_1.defaultComponentTheme
};
//# sourceMappingURL=default.js.map
