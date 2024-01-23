import { BaseMark } from "../base/base-mark";

export class BasePolygonMark extends BaseMark {
    _getDefaultStyle() {
        return Object.assign(Object.assign({}, super._getDefaultStyle()), {
            points: []
        });
    }
}
//# sourceMappingURL=base-polygon.js.map
