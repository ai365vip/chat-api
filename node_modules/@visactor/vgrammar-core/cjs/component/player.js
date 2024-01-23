"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerPlayer = exports.Player = exports.generateDiscretePlayerAttributes = exports.generateContinuousPlayerAttributes = void 0;

const vutils_1 = require("@visactor/vutils"), vrender_components_1 = require("@visactor/vrender-components"), graph_1 = require("../graph"), component_1 = require("../view/component"), encode_1 = require("../graph/mark/encode"), factory_1 = require("../core/factory"), player_filter_1 = require("../interactions/player-filter"), filter_1 = require("../interactions/filter"), generateContinuousPlayerAttributes = (data, theme, addition) => {
    var _a;
    const playerTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.continuousPlayer;
    return (0, vutils_1.merge)({}, playerTheme, {
        data: data,
        dataIndex: 0
    }, null != addition ? addition : {});
};

exports.generateContinuousPlayerAttributes = generateContinuousPlayerAttributes;

const generateDiscretePlayerAttributes = (data, theme, addition) => {
    var _a;
    const playerTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.discretePlayer;
    return (0, vutils_1.merge)({}, playerTheme, {
        data: data,
        dataIndex: 0
    }, null != addition ? addition : {});
};

exports.generateDiscretePlayerAttributes = generateDiscretePlayerAttributes;

class Player extends component_1.Component {
    constructor(view, group) {
        super(view, graph_1.ComponentEnum.player, group), this.spec.componentType = graph_1.ComponentEnum.player, 
        this.spec.playerType = "auto";
    }
    parseAddition(spec) {
        return super.parseAddition(spec), this.playerType(spec.playerType), this.source(spec.source), 
        this;
    }
    playerType(playerType) {
        return this.spec.playerType = playerType, this._playerComponentType = null, this._prepareRejoin(), 
        this.commit(), this;
    }
    source(source) {
        var _a;
        if (this.spec.source) {
            const lastSource = null === (_a = this.spec) || void 0 === _a ? void 0 : _a.source, lastSourceDataGrammar = (0, 
            vutils_1.isArray)(lastSource) ? null : (0, vutils_1.isString)(lastSource) ? this.view.getDataById(lastSource) : lastSource;
            this.detach(lastSourceDataGrammar);
        }
        this.spec.source = source;
        const sourceDataGrammar = (0, vutils_1.isArray)(source) ? null : (0, vutils_1.isString)(source) ? this.view.getDataById(source) : source;
        return this.attach(sourceDataGrammar), this.commit(), this;
    }
    play() {
        return this.getGroupGraphicItem().play(), this;
    }
    pause() {
        return this.getGroupGraphicItem().pause(), this;
    }
    backward() {
        return this.getGroupGraphicItem().backward(), this;
    }
    forward() {
        return this.getGroupGraphicItem().forward(), this;
    }
    addGraphicItem(attrs, groupKey, newGraphicItem) {
        const initialAttributes = (0, vutils_1.merge)({
            slider: {
                handlerStyle: {
                    size: 16
                }
            }
        }, attrs), graphicItem = null != newGraphicItem ? newGraphicItem : factory_1.Factory.createGraphicComponent(this._getPlayerComponentType(), initialAttributes, {
            skipDefault: this.spec.skipTheme
        });
        return super.addGraphicItem(initialAttributes, groupKey, graphicItem);
    }
    _updateComponentEncoders() {
        const encoders = Object.assign({
            update: {}
        }, this.spec.encode), componentEncoders = Object.keys(encoders).reduce(((res, state) => {
            const encoder = encoders[state];
            return encoder && (res[state] = {
                callback: (datum, element, parameters) => {
                    var _a;
                    const theme = this.spec.skipTheme ? null : this.view.getCurrentTheme(), addition = (0, 
                    encode_1.invokeEncoder)(encoder, datum, element, parameters), source = this.spec.source, sourceDataGrammar = (0, 
                    vutils_1.isArray)(source) ? null : (0, vutils_1.isString)(source) ? this.view.getDataById(source) : source, sourceData = (0, 
                    vutils_1.isArray)(source) ? source : null !== (_a = null == sourceDataGrammar ? void 0 : sourceDataGrammar.getValue()) && void 0 !== _a ? _a : [];
                    switch (this._getPlayerComponentType()) {
                      case "continuousPlayer":
                        return (0, exports.generateContinuousPlayerAttributes)(sourceData, theme, addition);

                      case "discretePlayer":
                        return (0, exports.generateDiscretePlayerAttributes)(sourceData, theme, addition);
                    }
                }
            }), res;
        }), {});
        this._encoders = componentEncoders;
    }
    _getPlayerComponentType() {
        return this._playerComponentType || (this.spec.playerType && "auto" !== this.spec.playerType ? this._playerComponentType = "discrete" === this.spec.playerType ? "discretePlayer" : "continuous" === this.spec.playerType ? "continuousPlayer" : "discretePlayer" : this._playerComponentType = "discretePlayer"), 
        this._playerComponentType;
    }
}

exports.Player = Player, Player.componentType = graph_1.ComponentEnum.player;

const registerPlayer = () => {
    factory_1.Factory.registerGraphicComponent(graph_1.PlayerEnum.continuousPlayer, (attrs => new vrender_components_1.ContinuousPlayer(attrs))), 
    factory_1.Factory.registerGraphicComponent(graph_1.PlayerEnum.discretePlayer, (attrs => new vrender_components_1.DiscretePlayer(attrs))), 
    factory_1.Factory.registerComponent(graph_1.ComponentEnum.player, Player), (0, vutils_1.mixin)(filter_1.Filter, filter_1.FilterMixin), 
    factory_1.Factory.registerInteraction(player_filter_1.PlayerFilter.type, player_filter_1.PlayerFilter);
};

exports.registerPlayer = registerPlayer;
//# sourceMappingURL=player.js.map