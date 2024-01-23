export declare const DEFAULT_HANDLER_PATH = "M -0.0544 0.25 C -0.0742 0.25 -0.0901 0.234 -0.0901 0.2143 L -0.0901 -0.1786 C -0.0901 -0.1983 -0.0742 -0.2143 -0.0544 -0.2143 L -0.0187 -0.2143 L -0.0187 -0.5 L 0.017 -0.5 L 0.017 -0.2143 L 0.0527 -0.2143 C 0.0724 -0.2143 0.0884 -0.1983 0.0884 -0.1786 L 0.0884 0.2143 C 0.0884 0.234 0.0724 0.25 0.0527 0.25 L 0.017 0.25 L 0.017 0.5 L -0.0187 0.5 L -0.0187 0.25 L -0.0544 0.25 Z M -0.0187 -0.1429 L -0.0544 -0.1429 L -0.0544 0.1786 L -0.0187 0.1786 L -0.0187 -0.1429 Z M 0.0527 -0.1429 L 0.017 -0.1429 L 0.017 0.1786 L 0.0527 0.1786 L 0.0527 -0.1429 Z";
export declare const DEFAULT_DATA_ZOOM_ATTRIBUTES: {
    orient: string;
    showDetail: string;
    brushSelect: boolean;
    zoomLock: boolean;
    minSpan: number;
    maxSpan: number;
    delayType: string;
    delayTime: number;
    realTime: boolean;
    backgroundStyle: {
        fill: string;
        stroke: string;
        lineWidth: number;
        cornerRadius: number;
    };
    dragMaskStyle: {
        fill: string;
        fillOpacity: number;
    };
    backgroundChartStyle: {
        area: {
            visible: boolean;
            stroke: string;
            lineWidth: number;
            fill: string;
        };
        line: {
            visible: boolean;
            stroke: string;
            lineWidth: number;
        };
    };
    selectedBackgroundStyle: {
        fill: string;
        fillOpacity: number;
    };
    selectedBackgroundChartStyle: {
        area: {
            visible: boolean;
            stroke: string;
            lineWidth: number;
            fill: string;
        };
        line: {
            visible: boolean;
            stroke: string;
            lineWidth: number;
        };
    };
    middleHandlerStyle: {
        visible: boolean;
        background: {
            size: number;
            style: {
                fill: string;
                stroke: string;
                cornerRadius: number;
            };
        };
        icon: {
            size: number;
            fill: string;
            stroke: string;
            symbolType: string;
            lineWidth: number;
        };
    };
    startHandlerStyle: {
        visible: boolean;
        triggerMinSize: number;
        symbolType: string;
        fill: string;
        stroke: string;
        lineWidth: number;
    };
    endHandlerStyle: {
        visible: boolean;
        triggerMinSize: number;
        symbolType: string;
        fill: string;
        stroke: string;
        lineWidth: number;
    };
    startTextStyle: {
        padding: number;
        textStyle: {
            fontSize: number;
            fill: string;
        };
    };
    endTextStyle: {
        padding: number;
        textStyle: {
            fontSize: number;
            fill: string;
        };
    };
};
export declare const DEFAULT_HANDLER_ATTR_MAP: {
    horizontal: {
        angle: number;
        strokeBoundsBuffer: number;
        boundsPadding: number;
        pickMode: string;
        cursor: string;
    };
    vertical: {
        angle: number;
        cursor: string;
        boundsPadding: number;
        pickMode: string;
        strokeBoundsBuffer: number;
    };
};
