"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DataSet = void 0;

const vutils_1 = require("@visactor/vutils"), uuid_1 = require("./utils/uuid");

class DataSet {
    constructor(options) {
        var _a;
        let name;
        this.options = options, this.isDataSet = !0, this.transformMap = {}, this.parserMap = {}, 
        this.dataViewMap = {}, this.target = new vutils_1.EventEmitter, name = (null == options ? void 0 : options.name) ? options.name : (0, 
        uuid_1.getUUID)("dataset"), this.name = name, this._logger = null !== (_a = null == options ? void 0 : options.logger) && void 0 !== _a ? _a : vutils_1.Logger.getInstance();
    }
    setLogger(logger) {
        this._logger = logger;
    }
    getDataView(name) {
        return this.dataViewMap[name];
    }
    setDataView(name, dataView) {
        var _a;
        this.dataViewMap[name] && (null === (_a = this._logger) || void 0 === _a || _a.error(`Error: dataView ${name} 之前已存在，请重新命名`)), 
        this.dataViewMap[name] = dataView;
    }
    removeDataView(name) {
        this.dataViewMap[name] = null, delete this.dataViewMap[name];
    }
    registerParser(name, parser) {
        var _a;
        this.parserMap[name] && (null === (_a = this._logger) || void 0 === _a || _a.warn(`Warn: transform ${name} 之前已注册，执行覆盖逻辑`)), 
        this.parserMap[name] = parser;
    }
    removeParser(name) {
        this.parserMap[name] = null, delete this.parserMap[name];
    }
    getParser(name) {
        return this.parserMap[name] || this.parserMap.default;
    }
    registerTransform(name, transform) {
        var _a;
        this.transformMap[name] && (null === (_a = this._logger) || void 0 === _a || _a.warn(`Warn: transform ${name} 之前已注册，执行覆盖逻辑`)), 
        this.transformMap[name] = transform;
    }
    removeTransform(name) {
        this.transformMap[name] = null, delete this.transformMap[name];
    }
    getTransform(name) {
        return this.transformMap[name];
    }
    multipleDataViewAddListener(list, event, call) {
        this._callMap || (this._callMap = new Map);
        let callAd = this._callMap.get(call);
        callAd || (callAd = () => {
            list.some((l => l.isRunning)) || call();
        }), list.forEach((l => {
            l.target.addListener(event, callAd);
        })), this._callMap.set(call, callAd);
    }
    allDataViewAddListener(event, call) {
        this.multipleDataViewAddListener(Object.values(this.dataViewMap), event, call);
    }
    multipleDataViewRemoveListener(list, event, call) {
        if (this._callMap) {
            const callAd = this._callMap.get(call);
            callAd && list.forEach((l => {
                l.target.removeListener(event, callAd);
            })), this._callMap.delete(call);
        }
    }
    multipleDataViewUpdateInParse(newData) {
        newData.forEach((d => {
            var _a;
            return null === (_a = this.getDataView(d.name)) || void 0 === _a ? void 0 : _a.markRunning();
        })), newData.forEach((d => {
            var _a;
            return null === (_a = this.getDataView(d.name)) || void 0 === _a ? void 0 : _a.parseNewData(d.data, d.options);
        }));
    }
    multipleDataViewUpdateInRawData(newData) {
        newData.forEach((d => {
            var _a;
            return null === (_a = this.getDataView(d.name)) || void 0 === _a ? void 0 : _a.markRunning();
        })), newData.forEach((d => {
            var _a;
            return null === (_a = this.getDataView(d.name)) || void 0 === _a ? void 0 : _a.updateRawData(d.data, d.options);
        }));
    }
    destroy() {
        this.transformMap = null, this.parserMap = null, this.dataViewMap = null, this._callMap = null, 
        this.target.removeAllListeners();
    }
}

exports.DataSet = DataSet;
//# sourceMappingURL=data-set.js.map