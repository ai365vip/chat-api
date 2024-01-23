"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DrillDown = void 0;

const brush_base_1 = require("./brush-base"), vutils_1 = require("@visactor/vutils"), enums_1 = require("../graph/enums");

class DrillDown extends brush_base_1.BrushBase {
    constructor(view, option) {
        super(view, Object.assign({}, DrillDown.defaultOptions, option)), this.type = DrillDown.type, 
        this.handleBrushUpdate = event => {
            const elements = [];
            let filterValue = [];
            this._marks.forEach((mark => {
                mark.elements.forEach((el => {
                    this.isBrushContainGraphicItem(event.detail.operateMask, el.getGraphicItem()) && (elements.push(el), 
                    filterValue = filterValue.concat((0, vutils_1.array)(el.getDatum())));
                }));
            })), this._data && (filterValue = Array.from(new Set(filterValue)), this._filterValue && filterValue.length === this._filterValue.length && !filterValue.some((datum => !this._filterValue.includes(datum))) || (this._filterValue = filterValue, 
            this.handleFilter())), this._dispatchEvent(event, elements);
        }, this.handleTrigger = event => {
            const element = event.element;
            if (element && this._marks && this._marks.includes(element.mark)) {
                const filterValue = (0, vutils_1.array)(element.getDatum());
                this._filterValue && filterValue.length === this._filterValue.length && !filterValue.some((datum => !this._filterValue.includes(datum))) || (this._filterValue = filterValue, 
                this.handleFilter());
            }
        }, this._data = (0, vutils_1.isString)(this.options.target.data) ? view.getDataById(this.options.target.data) : this.options.target.data;
    }
    getEvents() {
        if (!this._data) return [];
        const transform = this.options.target.transform;
        return this._filterData(this._data, null, enums_1.DataFilterRank.drillDown, null, void 0, ((data, filterValue) => {
            const nextData = filterValue || data;
            return transform ? transform(data, filterValue) : nextData;
        })), this.options.brush ? super.getEvents() : [ {
            type: this.options.trigger,
            handler: this.handleTrigger
        } ];
    }
}

exports.DrillDown = DrillDown, DrillDown.type = "drill-down", DrillDown.defaultOptions = {
    brush: !1,
    trigger: "click"
};
//# sourceMappingURL=drill-down.js.map