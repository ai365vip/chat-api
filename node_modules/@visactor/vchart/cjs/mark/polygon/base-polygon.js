"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BasePolygonMark = void 0;

const base_mark_1 = require("../base/base-mark");

class BasePolygonMark extends base_mark_1.BaseMark {
    _getDefaultStyle() {
        return Object.assign(Object.assign({}, super._getDefaultStyle()), {
            points: []
        });
    }
}

exports.BasePolygonMark = BasePolygonMark;
//# sourceMappingURL=base-polygon.js.map
