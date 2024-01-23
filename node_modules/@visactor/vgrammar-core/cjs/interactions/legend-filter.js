"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.LegendFilter = void 0;

const vrender_components_1 = require("@visactor/vrender-components"), enums_1 = require("../graph/enums"), vutils_1 = require("@visactor/vutils"), filter_1 = require("./filter");

class LegendFilter extends filter_1.Filter {
    constructor(view, options) {
        super(view, options), this.type = LegendFilter.type, this.options = Object.assign({}, LegendFilter.defaultOptions, options), 
        this._marks = view.getMarksBySelector(this.options.source).filter((mark => mark.markType === enums_1.GrammarMarkType.component && "legend" === mark.componentType)), 
        this._data = (0, vutils_1.isString)(this.options.target.data) ? view.getDataById(this.options.target.data) : this.options.target.data;
    }
    getEvents() {
        if (!this._marks || 0 === this._marks.length) return [];
        const legend = this._marks[0];
        if (!this._data || !legend) return [];
        const isContinuous = legend.isContinuousLegend(), filter = this.options.target.filter, transform = this.options.target.transform, dataFilter = (0, 
        vutils_1.isString)(filter) ? isContinuous ? (datum, filterValue) => datum[filter] >= filterValue.start && datum[filter] <= filterValue.end : (datum, filterValue) => filterValue.includes(datum[filter]) : filter;
        this._filterData(this._data, legend, enums_1.DataFilterRank.legend, (event => isContinuous ? {
            start: event.detail.value[0],
            end: event.detail.value[1]
        } : event.detail.currentSelected), dataFilter, transform);
        return [ {
            type: isContinuous ? "change" : vrender_components_1.LegendEvent.legendItemClick,
            handler: this.handleFilter
        } ];
    }
}

exports.LegendFilter = LegendFilter, LegendFilter.type = "legend-filter", LegendFilter.defaultOptions = {};
//# sourceMappingURL=legend-filter.js.map