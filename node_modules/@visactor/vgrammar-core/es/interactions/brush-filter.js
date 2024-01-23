import { BrushBase } from "./brush-base";

import { isString, array } from "@visactor/vutils";

import { DataFilterRank } from "../graph/enums";

export class BrushFilter extends BrushBase {
    constructor(view, option) {
        super(view, Object.assign({}, BrushFilter.defaultOptions, option)), this.type = BrushFilter.type, 
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
        }, this._data = isString(this.options.target.data) ? view.getDataById(this.options.target.data) : this.options.target.data;
    }
    getEvents() {
        if (!this._data) return [];
        const transform = this.options.target.transform;
        return this._filterData(this._data, null, DataFilterRank.brush, null, void 0, ((data, filterValue) => {
            const nextData = filterValue || data;
            return transform ? transform(data, filterValue) : nextData;
        })), super.getEvents();
    }
}

BrushFilter.type = "brush-filter", BrushFilter.defaultOptions = {};
//# sourceMappingURL=brush-filter.js.map