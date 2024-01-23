import { AABBBounds } from "@visactor/vutils";

import { DEFAULT_TEXT_FONT_FAMILY } from "../constant";

export const defaultAttributes = {
    panel: {
        visible: !0,
        cornerRadius: [ 3, 3, 3, 3 ],
        fill: "white",
        shadow: !0,
        shadowBlur: 12,
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowSpread: 0,
        stroke: "white"
    },
    titleStyle: {
        value: {
            fill: "#4E5969",
            fontFamily: DEFAULT_TEXT_FONT_FAMILY,
            fontSize: 14,
            lineHeight: 18,
            textAlign: "left",
            textBaseline: "middle"
        },
        spaceRow: 6
    },
    contentStyle: {
        shape: {
            fill: "black",
            size: 8,
            symbolType: "circle",
            spacing: 6
        },
        key: {
            fill: "#4E5969",
            fontFamily: DEFAULT_TEXT_FONT_FAMILY,
            fontSize: 12,
            lineHeight: 18,
            textAlign: "left",
            textBaseline: "middle",
            spacing: 26
        },
        value: {
            fill: "#4E5969",
            fontFamily: DEFAULT_TEXT_FONT_FAMILY,
            fontSize: 12,
            lineHeight: 18,
            textAlign: "right",
            textBaseline: "middle",
            spacing: 0
        },
        spaceRow: 6
    },
    padding: 10,
    positionX: "right",
    positionY: "bottom",
    offsetX: 10,
    offsetY: 10,
    parentBounds: (new AABBBounds).setValue(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
    autoCalculatePosition: !0,
    autoMeasure: !0,
    pickable: !1,
    childrenPickable: !1,
    zIndex: 500
};

export const TOOLTIP_POSITION_ATTRIBUTES = [ "pointerX", "pointerY", "offsetX", "offsetY", "positionX", "positionY", "parentBounds" ];
//# sourceMappingURL=config.js.map
