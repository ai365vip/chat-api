"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.darkTheme = void 0;

const color_scheme_1 = require("./color-scheme");

exports.darkTheme = {
    name: "dark",
    colorScheme: color_scheme_1.colorScheme,
    component: {
        dataZoom: {
            selectedBackground: {
                style: {
                    fillOpacity: .4,
                    outerBorder: {
                        strokeOpacity: .4
                    }
                }
            }
        }
    }
};
//# sourceMappingURL=index.js.map
