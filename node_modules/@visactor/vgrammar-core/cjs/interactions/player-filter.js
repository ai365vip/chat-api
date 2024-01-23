"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.PlayerFilter = void 0;

const enums_1 = require("../graph/enums"), vutils_1 = require("@visactor/vutils"), filter_1 = require("./filter"), vrender_components_1 = require("@visactor/vrender-components");

class PlayerFilter extends filter_1.Filter {
    constructor(view, options) {
        super(view, options), this.type = PlayerFilter.type, this.options = Object.assign({}, PlayerFilter.defaultOptions, options), 
        this._marks = view.getMarksBySelector(this.options.source).filter((mark => mark.markType === enums_1.GrammarMarkType.component && "player" === mark.componentType)), 
        this._data = (0, vutils_1.isString)(this.options.target.data) ? view.getDataById(this.options.target.data) : this.options.target.data;
    }
    getEvents() {
        if (!this._marks || 0 === this._marks.length) return [];
        const player = this._marks[0];
        if (!this._data || !player) return [];
        const transform = this.options.target.transform;
        return this._filterData(this._data, player, enums_1.DataFilterRank.player, (event => ({
            index: event.detail.index,
            value: event.detail.value
        })), void 0, ((data, filterValue) => transform ? transform(data, filterValue) : filterValue.value)), 
        [ {
            type: vrender_components_1.PlayerEventEnum.OnChange,
            handler: this.handleFilter
        } ];
    }
}

exports.PlayerFilter = PlayerFilter, PlayerFilter.type = "player-filter", PlayerFilter.defaultOptions = {};
//# sourceMappingURL=player-filter.js.map