import { BrushBase } from "./brush-base";

import { isString, array } from "@visactor/vutils";

import { DataFilterRank } from "../graph/enums";

export class DrillDown extends BrushBase {
    constructor(view, option) {
        super(view, Object.assign({}, DrillDown.defaultOptions, option)), this.type = DrillDown.type, 
        this.handleBrushUpdate = event => {
            const elements = [];
            let filterValue = [];
            this._marks.forEach((mark => {
                mark.elements.forEach((el => {
                    this.isBrushContainGraphicItem(event.detail.operateMask, el.getGraphicItem()) && (elements.push(el), 
                    filterValue = filterValue.concat(array(el.getDatum())));
                }));
            })), this._data && (filterValue = Array.from(new Set(filterValue)), this._filterValue && filterValue.length === this._filterValue.length && !filterValue.some((datum => !this._filterValue.includes(datum))) || (this._filterValue = filterValue, 
            this.handleFilter())), this._dispatchEvent(event, elements);
        }, this.handleTrigger = event => {
            const element = event.element;
            if (element && this._marks && this._marks.includes(element.mark)) {
                const filterValue = array(element.getDatum());
                this._filterValue && filterValue.length === this._filterValue.length && !filterValue.some((datum => !this._filterValue.includes(datum))) || (this._filterValue = filterValue, 
                this.handleFilter());
            }
        }, this._data = isString(this.options.target.data) ? view.getDataById(this.options.target.data) : this.options.target.data;
    }
    getEvents() {
        if (!this._data) return [];
        const transform = this.options.target.transform;
        return this._filterData(this._data, null, DataFilterRank.drillDown, null, void 0, ((data, filterValue) => {
            const nextData = filterValue || data;
            return transform ? transform(data, filterValue) : nextData;
        })), this.options.brush ? super.getEvents() : [ {
            type: this.options.trigger,
            handler: this.handleTrigger
        } ];
    }
}

DrillDown.type = "drill-down", DrillDown.defaultOptions = {
    brush: !1,
    trigger: "click"
};
//# sourceMappingURL=drill-down.js.map