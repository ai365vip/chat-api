import { darkTheme } from "./dark";

import { defaultTheme } from "./default";

export class ThemeManager {
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

ThemeManager._themes = new Map, ThemeManager.registerTheme("default", defaultTheme), 
ThemeManager.registerTheme("dark", darkTheme);
//# sourceMappingURL=theme-manager.js.map
