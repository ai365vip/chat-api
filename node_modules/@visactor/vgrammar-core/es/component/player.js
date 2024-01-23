import { isArray, isString, merge, mixin } from "@visactor/vutils";

import { ContinuousPlayer, DiscretePlayer } from "@visactor/vrender-components";

import { ComponentEnum, PlayerEnum } from "../graph";

import { Component } from "../view/component";

import { invokeEncoder } from "../graph/mark/encode";

import { Factory } from "../core/factory";

import { PlayerFilter } from "../interactions/player-filter";

import { Filter, FilterMixin } from "../interactions/filter";

export const generateContinuousPlayerAttributes = (data, theme, addition) => {
    var _a;
    const playerTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.continuousPlayer;
    return merge({}, playerTheme, {
        data: data,
        dataIndex: 0
    }, null != addition ? addition : {});
};

export const generateDiscretePlayerAttributes = (data, theme, addition) => {
    var _a;
    const playerTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.discretePlayer;
    return merge({}, playerTheme, {
        data: data,
        dataIndex: 0
    }, null != addition ? addition : {});
};

export class Player extends Component {
    constructor(view, group) {
        super(view, ComponentEnum.player, group), this.spec.componentType = ComponentEnum.player, 
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
            const lastSource = null === (_a = this.spec) || void 0 === _a ? void 0 : _a.source, lastSourceDataGrammar = isArray(lastSource) ? null : isString(lastSource) ? this.view.getDataById(lastSource) : lastSource;
            this.detach(lastSourceDataGrammar);
        }
        this.spec.source = source;
        const sourceDataGrammar = isArray(source) ? null : isString(source) ? this.view.getDataById(source) : source;
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
        const initialAttributes = merge({
            slider: {
                handlerStyle: {
                    size: 16
                }
            }
        }, attrs), graphicItem = null != newGraphicItem ? newGraphicItem : Factory.createGraphicComponent(this._getPlayerComponentType(), initialAttributes, {
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
                    const theme = this.spec.skipTheme ? null : this.view.getCurrentTheme(), addition = invokeEncoder(encoder, datum, element, parameters), source = this.spec.source, sourceDataGrammar = isArray(source) ? null : isString(source) ? this.view.getDataById(source) : source, sourceData = isArray(source) ? source : null !== (_a = null == sourceDataGrammar ? void 0 : sourceDataGrammar.getValue()) && void 0 !== _a ? _a : [];
                    switch (this._getPlayerComponentType()) {
                      case "continuousPlayer":
                        return generateContinuousPlayerAttributes(sourceData, theme, addition);

                      case "discretePlayer":
                        return generateDiscretePlayerAttributes(sourceData, theme, addition);
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

Player.componentType = ComponentEnum.player;

export const registerPlayer = () => {
    Factory.registerGraphicComponent(PlayerEnum.continuousPlayer, (attrs => new ContinuousPlayer(attrs))), 
    Factory.registerGraphicComponent(PlayerEnum.discretePlayer, (attrs => new DiscretePlayer(attrs))), 
    Factory.registerComponent(ComponentEnum.player, Player), mixin(Filter, FilterMixin), 
    Factory.registerInteraction(PlayerFilter.type, PlayerFilter);
};
//# sourceMappingURL=player.js.map