"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.darkTheme = void 0;

const component_1 = require("./common/component"), constants_1 = require("./common/constants"), mark_1 = require("./common/mark"), darkComponents = Object.assign({}, component_1.defaultComponentTheme);

darkComponents.axis = Object.assign({}, darkComponents.axis, {
    label: {
        style: {
            fill: "#bbbdc3"
        }
    },
    line: {
        style: {
            stroke: "#4b4f54"
        }
    },
    tick: {
        style: {
            stroke: "#4b4f54"
        }
    },
    subTick: {
        style: {
            stroke: "#4b4f54"
        }
    }
}), darkComponents.circleAxis = Object.assign({}, darkComponents.circleAxis, {
    label: {
        style: {
            fill: "#bbbdc3"
        }
    },
    line: {
        style: {
            stroke: "#4b4f54"
        }
    },
    tick: {
        style: {
            stroke: "#4b4f54"
        }
    },
    subTick: {
        style: {
            stroke: "#4b4f54"
        }
    }
}), darkComponents.grid = Object.assign({}, darkComponents.grid, {
    style: {
        stroke: "#404349"
    }
}), darkComponents.circleGrid = Object.assign({}, darkComponents.circleGrid, {
    style: {
        stroke: "#404349"
    }
}), darkComponents.rectLabel = Object.assign({}, darkComponents.rectLabel, {
    data: [ {
        text: "",
        fill: "#888c93",
        data: {}
    } ]
}), darkComponents.lineLabel = Object.assign({}, darkComponents.lineLabel, {
    data: [ {
        text: "",
        fill: "#888c93",
        data: {}
    } ]
}), darkComponents.symbolLabel = Object.assign({}, darkComponents.symbolLabel, {
    data: [ {
        text: "",
        fill: "#888c93",
        data: {}
    } ]
}), darkComponents.title = Object.assign({}, darkComponents.title, {
    textStyle: {
        fill: "#fdfdfd"
    },
    subtextStyle: {
        fill: "#888c93"
    }
}), exports.darkTheme = {
    name: "dark",
    padding: constants_1.DEFAULT_PADDING,
    background: "#202226",
    palette: {
        default: [ "#5383F4", "#7BCF8E", "#FF9D2C", "#FFDB26", "#7568D9", "#80D8FB", "#1857A3", "#CAB0E8", "#FF8867", "#B9E493", "#2CB4A8", "#B9E4E3" ]
    },
    marks: mark_1.defaultMarkTheme,
    components: darkComponents
};
//# sourceMappingURL=dark.js.map
