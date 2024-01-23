"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.ThemeManager = void 0;

const dark_1 = require("./dark"), default_1 = require("./default");

class ThemeManager {
    static registerTheme(name, theme) {
        name && ThemeManager._themes.set(name, theme);
    }
    static unregisterTheme(name) {
        ThemeManager._themes.delete(name);
    }
    static getTheme(name) {
        return ThemeManager._themes.get(name);
    }
    static getDefaultTheme() {
        return ThemeManager.getTheme("default");
    }
}

exports.ThemeManager = ThemeManager, ThemeManager._themes = new Map, ThemeManager.registerTheme("default", default_1.defaultTheme), 
ThemeManager.registerTheme("dark", dark_1.darkTheme);
//# sourceMappingURL=theme-manager.js.map
