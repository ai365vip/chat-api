"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DatazoomFilter = void 0;

const enums_1 = require("../graph/enums"), vutils_1 = require("@visactor/vutils"), filter_1 = require("./filter"), scale_1 = require("../util/scale");

class DatazoomFilter extends filter_1.Filter {
    constructor(view, options) {
        super(view, options), this.type = DatazoomFilter.type, this.options = Object.assign({}, DatazoomFilter.defaultOptions, options), 
        this._marks = view.getMarksBySelector(this.options.source).filter((mark => mark.markType === enums_1.GrammarMarkType.component && "datazoom" === mark.componentType)), 
        this._data = (0, vutils_1.isString)(this.options.target.data) ? view.getDataById(this.options.target.data) : this.options.target.data;
    }
    getEvents() {
        if (!this._marks || 0 === this._marks.length) return [];
        const datazoom = this._marks[0];
        if (!this._data || !datazoom) return [];
        const filter = this.options.target.filter, transform = this.options.target.transform, dataFilter = (0, 
        vutils_1.isString)(filter) ? (datum, filterValue) => {
            if ((0, vutils_1.isNil)(filterValue.start) || (0, vutils_1.isNil)(filterValue.end)) return !0;
            const scale = datazoom.getDatazoomMainScale(), datumRatio = (0, scale_1.getScaleRangeRatio)(scale, datum[filter]);
            return filterValue.startRatio <= datumRatio && filterValue.endRatio >= datumRatio;
        } : filter;
        return this._filterData(this._data, datazoom, enums_1.DataFilterRank.datazoom, (event => {
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

exports.DatazoomFilter = DatazoomFilter, DatazoomFilter.type = "datazoom-filter", 
DatazoomFilter.defaultOptions = {};
//# sourceMappingURL=datazoom-filter.js.map