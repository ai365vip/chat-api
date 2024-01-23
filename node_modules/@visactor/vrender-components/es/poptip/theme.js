import { merge } from "@visactor/vutils";

export const DEFAULT_THEME = {
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
};

export const theme = {
    poptip: merge({}, DEFAULT_THEME)
};
//# sourceMappingURL=theme.js.map
