import { DataFilterRank, GrammarMarkType } from "../graph/enums";

import { isString } from "@visactor/vutils";

import { Filter } from "./filter";

export class SliderFilter extends Filter {
    constructor(view, options) {
        super(view, options), this.type = SliderFilter.type, this.options = Object.assign({}, SliderFilter.defaultOptions, options), 
        this._marks = view.getMarksBySelector(this.options.source).filter((mark => mark.markType === GrammarMarkType.component && "slider" === mark.componentType)), 
        this._data = isString(this.options.target.data) ? view.getDataById(this.options.target.data) : this.options.target.data;
    }
    getEvents() {
        if (!this._marks || 0 === this._marks.length) return [];
        const slider = this._marks[0];
        if (!this._data || !slider) return [];
        const filter = this.options.target.filter, transform = this.options.target.transform, dataFilter = isString(filter) ? (datum, filterValue) => datum[filter] >= filterValue.start && datum[filter] <= filterValue.end : filter;
        return this._filterData(this._data, slider, DataFilterRank.slider, (event => ({
            start: event.detail.value[0],
            end: event.detail.value[1]
        })), dataFilter, transform), [ {
            type: "change",
            handler: this.handleFilter
        } ];
    }
}

SliderFilter.type = "slider-filter", SliderFilter.defaultOptions = {};
//# sourceMappingURL=slider-filter.js.map
