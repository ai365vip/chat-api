const axis = {
    label: {
        visible: !0,
        inside: !1,
        space: 4,
        style: {
            fontSize: 12,
            fill: "#89909d",
            fontWeight: "normal",
            fillOpacity: 1
        }
    },
    tick: {
        visible: !0,
        inside: !1,
        alignWithLabel: !0,
        length: 4,
        style: {
            lineWidth: 1,
            stroke: "#D9DDE4",
            strokeOpacity: 1
        }
    },
    subTick: {
        visible: !1,
        inside: !1,
        count: 4,
        length: 2,
        style: {
            lineWidth: 1,
            stroke: "#D9DDE4",
            strokeOpacity: 1
        }
    },
    line: {
        visible: !0,
        style: {
            lineWidth: 1,
            stroke: "#D9DDE4",
            strokeOpacity: 1
        }
    },
    items: [],
    start: {
        x: 0,
        y: 0
    },
    end: {
        x: 100,
        y: 0
    },
    x: 0,
    y: 0
}, circleAxis = {
    title: {
        space: 4,
        padding: [ 0, 0, 0, 0 ],
        textStyle: {
            fontSize: 12,
            fill: "#333333",
            fontWeight: "normal",
            fillOpacity: 1
        },
        text: "theta"
    },
    label: {
        visible: !0,
        inside: !1,
        space: 4,
        style: {
            fontSize: 12,
            fill: "#6F6F6F",
            fontWeight: "normal",
            fillOpacity: 1
        }
    },
    tick: {
        visible: !0,
        inside: !1,
        alignWithLabel: !0,
        length: 4,
        style: {
            lineWidth: 1,
            stroke: "#D9DDE4",
            strokeOpacity: 1
        }
    },
    subTick: {
        visible: !1,
        inside: !1,
        count: 4,
        length: 2,
        style: {
            lineWidth: 1,
            stroke: "#D9DDE4",
            strokeOpacity: 1
        }
    },
    line: {
        visible: !0,
        style: {
            lineWidth: 1,
            stroke: "#D9DDE4",
            strokeOpacity: 1
        }
    },
    items: [],
    startAngle: 0,
    endAngle: 2 * Math.PI,
    radius: 100,
    innerRadius: 0,
    center: {
        x: 0,
        y: 0
    },
    x: 0,
    y: 0
}, grid = {
    style: {
        stroke: "#f1f2f5"
    }
}, circleGrid = {
    style: {
        stroke: "#f1f2f5"
    }
}, discreteLegend = {
    layout: "vertical",
    title: {
        align: "start",
        space: 12,
        textStyle: {
            fontSize: 12,
            fontWeight: "bold",
            fill: "#2C3542"
        }
    },
    item: {
        spaceCol: 10,
        spaceRow: 10,
        shape: {
            space: 4,
            style: {
                size: 10,
                cursor: "pointer"
            },
            state: {
                selectedHover: {
                    opacity: .85
                },
                unSelected: {
                    fill: "#D8D8D8",
                    stroke: "#D8D8D8",
                    fillOpacity: .5
                }
            }
        },
        label: {
            space: 4,
            style: {
                fontSize: 12,
                fill: "black",
                cursor: "pointer"
            },
            state: {
                selectedHover: {
                    opacity: .85
                },
                unSelected: {
                    fill: "#D8D8D8",
                    fillOpacity: .5
                }
            }
        },
        value: {
            alignRight: !1,
            style: {
                fontSize: 12,
                fill: "#ccc",
                cursor: "pointer"
            },
            state: {
                selectedHover: {
                    opacity: .85
                },
                unSelected: {
                    fill: "#D8D8D8"
                }
            }
        },
        background: {
            style: {
                cursor: "pointer"
            },
            state: {
                selectedHover: {
                    fillOpacity: .7,
                    fill: "gray"
                },
                unSelectedHover: {
                    fillOpacity: .2,
                    fill: "gray"
                }
            }
        },
        focus: !1,
        focusIconStyle: {
            size: 10,
            fill: "#333",
            cursor: "pointer"
        },
        visible: !0,
        padding: {
            top: 2,
            bottom: 2,
            left: 2,
            right: 2
        }
    },
    autoPage: !0,
    pager: {
        space: 12,
        handler: {
            style: {
                size: 10
            },
            space: 4
        }
    },
    hover: !0,
    select: !0,
    selectMode: "multiple",
    allowAllCanceled: !1,
    items: [ {
        index: 0,
        id: "",
        label: "",
        shape: {
            fill: "#6690F2",
            stroke: "#6690F2",
            symbolType: "circle"
        }
    } ]
}, colorLegend = {
    title: {
        visible: !1,
        text: ""
    },
    colors: [],
    layout: "horizontal",
    railWidth: 200,
    railHeight: 8,
    railStyle: {
        cornerRadius: 5
    }
}, sizeLegend = {
    title: {
        visible: !1,
        text: ""
    },
    trackStyle: {
        fill: "#ccc"
    },
    layout: "horizontal",
    align: "bottom",
    railWidth: 200,
    railHeight: 6,
    min: 0,
    max: 1,
    value: [ 0, 1 ]
}, lineCrosshair = {
    start: {
        x: 0,
        y: 0
    },
    end: {
        x: 0,
        y: 0
    }
}, rectCrosshair = {
    start: {
        x: 0,
        y: 0
    },
    end: {
        x: 0,
        y: 0
    },
    rectStyle: {
        width: 10,
        height: 10
    }
}, sectorCrosshair = {
    center: {
        x: 0,
        y: 0
    },
    radius: 100,
    startAngle: 0,
    endAngle: Math.PI / 6
}, circleCrosshair = {
    center: {
        x: 0,
        y: 0
    },
    radius: 100,
    startAngle: 0,
    endAngle: 2 * Math.PI
}, polygonCrosshair = {
    center: {
        x: 0,
        y: 0
    },
    radius: 100,
    startAngle: 0,
    endAngle: 2 * Math.PI,
    sides: 6
}, slider = {
    layout: "horizontal",
    railWidth: 200,
    railHeight: 10,
    railStyle: {
        cornerRadius: 5
    },
    range: {
        draggableTrack: !0
    },
    startText: {
        visible: !0,
        text: "",
        space: 8
    },
    endText: {
        visible: !0,
        text: "",
        space: 8
    },
    min: 0,
    max: 1,
    value: [ 0, 1 ]
};

export const dataLabel = {
    size: {
        width: 400,
        height: 400
    },
    dataLabels: []
};

export const lineDataLabel = {
    type: "line-data",
    data: [ {
        text: ""
    } ],
    position: "top",
    overlap: {
        avoidBaseMark: !1,
        clampForce: !1
    },
    smartInvert: !1
};

export const lineLabel = {
    type: "line",
    data: [ {
        text: "",
        data: {}
    } ],
    position: "start",
    overlap: {
        avoidBaseMark: !1,
        clampForce: !1,
        size: {
            width: 1e3,
            height: 1e3
        }
    },
    smartInvert: !1
};

export const areaLabel = {
    type: "area",
    data: [ {
        text: "",
        data: {}
    } ],
    position: "end",
    overlap: {
        avoidBaseMark: !1,
        clampForce: !1,
        size: {
            width: 1e3,
            height: 1e3
        }
    },
    smartInvert: !1
};

export const rectLabel = {
    type: "rect",
    data: [ {
        text: "",
        fill: "#606773",
        data: {}
    } ],
    position: "top",
    overlap: {
        size: {
            width: 1e3,
            height: 1e3
        },
        strategy: [ {
            type: "position"
        } ]
    },
    smartInvert: !1
};

export const symbolLabel = {
    type: "symbol",
    data: [ {
        text: "",
        fill: "#606773",
        data: {}
    } ],
    position: "top",
    overlap: {
        avoidBaseMark: !0,
        size: {
            width: 1e3,
            height: 1e3
        },
        strategy: [ {
            type: "position"
        } ]
    },
    smartInvert: !1
};

export const arcLabel = {
    type: "arc",
    data: [ {
        text: "",
        fill: "#606773",
        data: {}
    } ],
    width: 800,
    height: 600,
    position: "outside",
    zIndex: 302
};

export const pointLabel = {
    data: [ {
        text: "",
        fill: "#606773",
        data: {}
    } ],
    overlap: {
        avoidBaseMark: !1,
        clampForce: !1,
        size: {
            width: 1e3,
            height: 1e3
        }
    },
    smartInvert: !1
};

export const datazoom = {
    orient: "bottom",
    showDetail: "auto",
    brushSelect: !0,
    start: 0,
    end: 1,
    position: {
        x: 0,
        y: 0
    },
    size: {
        width: 500,
        height: 40
    },
    previewData: []
};

export const continuousPlayer = {};

export const discretePlayer = {};

export const tooltip = {};

export const title = {
    textStyle: {
        fill: "#21252c"
    },
    subtextStyle: {
        fill: "#606773"
    }
};

export const scrollbar = {
    width: 12,
    height: 12,
    padding: [ 2, 2 ],
    railStyle: {
        fill: "rgba(0, 0, 0, .1)"
    }
};

export const defaultComponentTheme = {
    axis: axis,
    circleAxis: circleAxis,
    grid: grid,
    circleGrid: circleGrid,
    discreteLegend: discreteLegend,
    colorLegend: colorLegend,
    sizeLegend: sizeLegend,
    lineCrosshair: lineCrosshair,
    rectCrosshair: rectCrosshair,
    sectorCrosshair: sectorCrosshair,
    circleCrosshair: circleCrosshair,
    polygonCrosshair: polygonCrosshair,
    slider: slider,
    dataLabel: dataLabel,
    pointLabel: pointLabel,
    lineLabel: lineLabel,
    areaLabel: areaLabel,
    rectLabel: rectLabel,
    symbolLabel: symbolLabel,
    arcLabel: arcLabel,
    lineDataLabel: lineDataLabel,
    datazoom: datazoom,
    continuousPlayer: continuousPlayer,
    discretePlayer: discretePlayer,
    tooltip: tooltip,
    title: title,
    scrollbar: scrollbar
};
//# sourceMappingURL=component.js.map
