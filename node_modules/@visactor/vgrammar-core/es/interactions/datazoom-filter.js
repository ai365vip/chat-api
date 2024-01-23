import { DataFilterRank, GrammarMarkType } from "../graph/enums";

import { isNil, isString } from "@visactor/vutils";

import { Filter } from "./filter";

import { getScaleRangeRatio } from "../util/scale";

export class DatazoomFilter extends Filter {
    constructor(view, options) {
        super(view, options), this.type = DatazoomFilter.type, this.options = Object.assign({}, DatazoomFilter.defaultOptions, options), 
        this._marks = view.getMarksBySelector(this.options.source).filter((mark => mark.markType === GrammarMarkType.component && "datazoom" === mark.componentType)), 
        this._data = isString(this.options.target.data) ? view.getDataById(this.options.target.data) : this.options.target.data;
    }
    getEvents() {
        if (!this._marks || 0 === this._marks.length) return [];
        const datazoom = this._marks[0];
        if (!this._data || !datazoom) return [];
        const filter = this.options.target.filter, transform = this.options.target.transform, dataFilter = isString(filter) ? (datum, filterValue) => {
            if (isNil(filterValue.start) || isNil(filterValue.end)) return !0;
            const scale = datazoom.getDatazoomMainScale(), datumRatio = getScaleRangeRatio(scale, datum[filter]);
            return filterValue.startRatio <= datumRatio && filterValue.endRatio >= datumRatio;
        } : filter;
        return this._filterData(this._data, datazoom, DataFilterRank.datazoom, (event => {
            const startRatio = event.detail.start, endRatio = event.detail.end;
            return {
                startRatio: startRatio,
                endRatio: endRatio,
                start: datazoom.invertDatazoomRatio(startRatio),
                end: datazoom.invertDatazoomRatio(endRatio)
            };
        }), dataFilter, transform), [ {
            type: "change",
            handler: this.handleFilter
        } ];
    }
}

DatazoomFilter.type = "datazoom-filter", DatazoomFilter.defaultOptions = {};
//# sourceMappingURL=datazoom-filter.js.map