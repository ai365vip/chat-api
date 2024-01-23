"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.configureScale = exports.parseScaleConfig = exports.parseScaleDomainRange = exports.createScale = void 0;

const vutils_1 = require("@visactor/vutils"), vscale_1 = require("@visactor/vscale"), util_1 = require("./util"), vgrammar_util_1 = require("@visactor/vgrammar-util");

function createScale(type) {
    switch (type) {
      case "band":
        return new vscale_1.BandScale;

      case "linear":
        return new vscale_1.LinearScale;

      case "log":
        return new vscale_1.LogScale;

      case "ordinal":
        return new vscale_1.OrdinalScale;

      case "point":
        return new vscale_1.PointScale;

      case "pow":
        return new vscale_1.PowScale;

      case "quantile":
        return new vscale_1.QuantileScale;

      case "quantize":
        return new vscale_1.QuantizeScale;

      case "sqrt":
        return new vscale_1.SqrtScale;

      case "symlog":
        return new vscale_1.SymlogScale;

      case "threshold":
        return new vscale_1.ThresholdScale;

      case "time":
        return new vscale_1.TimeScale;

      case "utc":
        return new vscale_1.TimeScale(!0);

      case "identity":
        return new vscale_1.IdentityScale;
    }
    return new vscale_1.LinearScale;
}

function isScaleDataType(spec) {
    return !(0, vutils_1.isNil)(null == spec ? void 0 : spec.data);
}

function parseScaleDataType(spec, view) {
    var _a;
    if ((0, vutils_1.isString)(spec.data)) {
        const data = view.getGrammarById(spec.data);
        return data ? [ data ] : [];
    }
    return "data" === (null === (_a = spec.data) || void 0 === _a ? void 0 : _a.grammarType) ? [ spec.data ] : [];
}

function isMultiScaleDataType(spec) {
    return !(0, vutils_1.isNil)(null == spec ? void 0 : spec.datas);
}

function parseMultiScaleDataType(spec, view) {
    if (spec && spec.datas && spec.datas.length) {
        const res = [];
        return spec.datas.forEach((data => {
            const gramarBase = parseScaleDataType(data, view);
            gramarBase.length && res.push(gramarBase[0]);
        })), res;
    }
    return [];
}

function isScaleCoordinateType(spec) {
    return !(0, vutils_1.isNil)(null == spec ? void 0 : spec.coordinate);
}

function parseScaleCoordinateType(spec, view) {
    var _a;
    if ((0, vutils_1.isString)(spec.coordinate)) {
        const coordinate = view.getCoordinateById(spec.coordinate);
        return coordinate ? [ coordinate ] : [];
    }
    return "coordinate" === (null === (_a = spec.coordinate) || void 0 === _a ? void 0 : _a.grammarType) ? [ spec.coordinate ] : [];
}

function parseLinearScale(spec, view) {
    let dependencies = [];
    return dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.nice, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.niceMin, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.niceMax, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.min, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.max, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.zero, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.roundRange, view)), 
    dependencies;
}

function parsePowScale(spec, view) {
    return parseLinearScale(spec, view).concat((0, util_1.parseFunctionType)(spec.exponent, view));
}

function parseSymlogScale(spec, view) {
    return parseLinearScale(spec, view).concat((0, util_1.parseFunctionType)(spec.constant, view));
}

function parseLogScale(spec, view) {
    let dependencies = [];
    return dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.nice, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.min, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.max, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.zero, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.roundRange, view)), 
    dependencies;
}

function parseQuantizeScale(spec, view) {
    let dependencies = [];
    return dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.nice, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.niceMin, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.niceMax, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.min, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.max, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.zero, view)), 
    dependencies;
}

function parseOrdinalScale(spec, view) {
    return [];
}

function parseBaseBandScale(spec, view) {
    let dependencies = [];
    return dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.round, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.padding, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.paddingInner, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.paddingOuter, view)), 
    dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec.align, view)), 
    dependencies;
}

function parseBandScale(spec, view) {
    return parseBaseBandScale(spec, view).concat((0, util_1.parseFunctionType)(spec.paddingInner, view));
}

function parsePointScale(spec, view) {
    return parseBaseBandScale(spec, view);
}

function parseScaleDomainRange(domain, view) {
    return isScaleDataType(domain) ? parseScaleDataType(domain, view) : isMultiScaleDataType(domain) ? parseMultiScaleDataType(domain, view) : isScaleCoordinateType(domain) ? parseScaleCoordinateType(domain, view) : (0, 
    util_1.parseFunctionType)(domain, view);
}

function parseScaleConfig(type, config, view) {
    if ((0, vutils_1.isNil)(config)) return [];
    const deps = (0, util_1.parseFunctionType)(config.unknown, view);
    switch (type) {
      case "linear":
      case "sqrt":
        return deps.concat(parseLinearScale(config, view));

      case "ordinal":
        return deps.concat(parseOrdinalScale(config, view));

      case "band":
        return deps.concat(parseBandScale(config, view));

      case "point":
        return deps.concat(parsePointScale(config, view));

      case "pow":
        return deps.concat(parsePowScale(config, view));

      case "log":
      case "time":
      case "utc":
        return deps.concat(parseLogScale(config, view));

      case "symlog":
        return deps.concat(parseSymlogScale(config, view));

      case "quantize":
        return deps.concat(parseQuantizeScale(config, view));
    }
    return deps;
}

function configureScaleNice(spec, scale, parameters) {
    const nice = (0, util_1.invokeFunctionType)(spec.nice, parameters, scale);
    !0 === nice ? scale.nice() : (0, vutils_1.isValidNumber)(nice) && scale.nice(nice);
}

function configureScaleNiceMinMax(spec, scale, parameters) {
    const niceMax = (0, util_1.invokeFunctionType)(spec.niceMax, parameters, scale);
    !0 === niceMax ? scale.niceMax() : (0, vutils_1.isValidNumber)(niceMax) && scale.niceMax(niceMax);
    const niceMin = (0, util_1.invokeFunctionType)(spec.niceMin, parameters, scale);
    !0 === niceMin ? scale.niceMin() : (0, vutils_1.isValidNumber)(niceMin) && scale.niceMin(niceMin);
}

function configureScaleDomain(spec, scale, parameters) {
    const min = (0, util_1.invokeFunctionType)(spec.min, parameters, scale), max = (0, 
    util_1.invokeFunctionType)(spec.max, parameters, scale), zero = (0, util_1.invokeFunctionType)(spec.zero, parameters, scale), hasValidMin = (0, 
    vutils_1.isValidNumber)(min), hasValidmax = (0, vutils_1.isValidNumber)(max), prevDomain = scale.domain();
    if (2 === prevDomain.length && (hasValidMin || hasValidmax || zero)) {
        let newMin = Math.min(prevDomain[0], prevDomain[prevDomain.length - 1]), newMax = Math.max(prevDomain[0], prevDomain[prevDomain.length - 1]);
        zero && newMin > 0 ? newMin = 0 : hasValidMin && (newMin = Math.min(newMin, min)), 
        zero && newMax < 0 ? newMax = 0 : hasValidmax && (newMax = Math.max(newMax, max)), 
        scale.domain([ newMin, newMax ], !0);
    }
}

function configureContinuousScale(spec, scale, parameters) {
    var _a;
    (0, util_1.invokeFunctionType)(spec.roundRange, parameters, scale) && scale.rangeRound(scale.range(), !0);
    const {interpolate: interpolate, clamp: clamp} = null !== (_a = (0, util_1.invokeFunctionType)(spec.config, parameters, scale)) && void 0 !== _a ? _a : {};
    interpolate && scale.interpolate(interpolate, !0), (0, vutils_1.isNil)(clamp) || ((0, 
    vutils_1.isFunction)(clamp) ? scale.clamp(!0, clamp, !0) : scale.clamp(clamp, void 0, !0));
    const tickCount = (0, util_1.invokeFunctionType)(spec.tickCount, parameters, scale);
    tickCount && scale.tickData(tickCount);
}

function configureLinearScale(spec, scale, parameters) {
    configureScaleNice(spec, scale, parameters), configureScaleNiceMinMax(spec, scale, parameters), 
    configureScaleDomain(spec, scale, parameters), configureContinuousScale(spec, scale, parameters);
}

function configurePowScale(spec, scale, parameters) {
    configureLinearScale(spec, scale, parameters);
    const exponent = (0, util_1.invokeFunctionType)(spec.exponent, parameters, scale);
    exponent > 0 && scale.exponent(exponent);
}

function configureLogScale(spec, scale, parameters) {
    configureScaleNice(spec, scale, parameters), configureScaleDomain(spec, scale, parameters);
    const base = (0, util_1.invokeFunctionType)(spec.base, parameters, scale);
    base > 0 && scale.base(base), configureContinuousScale(spec, scale, parameters);
}

function configureSqrtScale(spec, scale, parameters) {
    configureLinearScale(spec, scale, parameters);
}

function configureTimeScale(spec, scale, parameters) {
    configureScaleNice(spec, scale, parameters), configureScaleDomain(spec, scale, parameters), 
    configureContinuousScale(spec, scale, parameters);
}

function configureSymlogScale(spec, scale, parameters) {
    configureLinearScale(spec, scale, parameters);
    const constant = (0, util_1.invokeFunctionType)(spec.constant, parameters, scale);
    (0, vutils_1.isValidNumber)(constant) && scale.constant(constant);
}

function configureQuantizeScale(spec, scale, parameters) {
    configureScaleNice(spec, scale, parameters), configureScaleNiceMinMax(spec, scale, parameters), 
    configureScaleDomain(spec, scale, parameters);
}

function configureBaseBandScale(spec, scale, parameters) {
    spec.round && scale.round((0, util_1.invokeFunctionType)(spec.round, parameters, scale), !0), 
    spec.padding && scale.padding((0, util_1.invokeFunctionType)(spec.padding, parameters, scale), !0), 
    spec.paddingInner && scale.paddingInner((0, util_1.invokeFunctionType)(spec.paddingInner, parameters, scale), !0), 
    spec.paddingOuter && scale.paddingOuter((0, util_1.invokeFunctionType)(spec.paddingOuter, parameters, scale), !0), 
    spec.align && scale.align((0, util_1.invokeFunctionType)(spec.align, parameters, scale), !0);
}

function configureBandScale(spec, scale, parameters) {
    return configureBaseBandScale(spec, scale, parameters);
}

function configurePointScale(spec, scale, parameters) {
    return configureBaseBandScale(spec, scale, parameters);
}

function parseFieldData(spec, parameters) {
    const field = spec.field, refData = (0, util_1.getGrammarOutput)(spec.data, parameters), fieldData = [];
    if ((0, vutils_1.isArray)(field)) field.forEach((entry => {
        const getter = (0, vgrammar_util_1.field)(entry);
        refData && refData.forEach((datum => {
            fieldData.push(getter(datum));
        }));
    })); else {
        const getter = (0, vgrammar_util_1.field)(field);
        refData && refData.forEach((datum => {
            fieldData.push(getter(datum));
        }));
    }
    return fieldData;
}

function parseMultiFieldData(spec, parameters) {
    let fieldData = [];
    return spec.datas.forEach((entry => {
        fieldData = fieldData.concat(parseFieldData(entry, parameters));
    })), fieldData;
}

function parseScaleDataTypeValue(fieldData, scale, sort, filterNumber) {
    return sort && fieldData.sort(sort), (0, vscale_1.isContinuous)(scale.type) ? (filterNumber && fieldData.filter((entry => (0, 
    vutils_1.isNumber)(entry))), [ (0, vutils_1.minInArray)(fieldData), (0, vutils_1.maxInArray)(fieldData) ]) : fieldData;
}

function configureScale(spec, scale, parameters) {
    if (isScaleDataType(spec.domain) ? scale.domain(parseScaleDataTypeValue(parseFieldData(spec.domain, parameters), scale, spec.domain.sort, !0), !0) : isMultiScaleDataType(spec.domain) ? scale.domain(parseScaleDataTypeValue(parseMultiFieldData(spec.domain, parameters), scale, spec.domain.sort, !0), !0) : scale.domain((0, 
    util_1.invokeFunctionType)(spec.domain, parameters, scale), !0), "identity" !== spec.type) if (isScaleDataType(spec.range)) scale.range(parseScaleDataTypeValue(parseFieldData(spec.range, parameters), scale), !0); else if (isMultiScaleDataType(spec.range)) scale.range(parseScaleDataTypeValue(parseMultiFieldData(spec.range, parameters), scale), !0); else if (isScaleCoordinateType(spec.range)) {
        const coord = (0, util_1.getGrammarOutput)(spec.range.coordinate, parameters);
        !(0, vscale_1.isDiscretizing)(scale.type) && coord && scale.range(coord.getRangeByDimension(spec.range.dimension, spec.range.isSubshaft, spec.range.reversed));
    } else scale.range((0, util_1.invokeFunctionType)(spec.range, parameters, scale), !0);
    switch ((0, vutils_1.isNil)(spec.unknown) || scale.unknown((0, util_1.invokeFunctionType)(spec.unknown, parameters, scale)), 
    spec.type) {
      case "linear":
        configureLinearScale(spec, scale, parameters), scale.rescale();
        break;

      case "band":
        configureBandScale(spec, scale, parameters), scale.rescale();
        break;

      case "point":
        configurePointScale(spec, scale, parameters), scale.rescale();
        break;

      case "pow":
        configurePowScale(spec, scale, parameters), scale.rescale();
        break;

      case "log":
        configureLogScale(spec, scale, parameters), scale.rescale();
        break;

      case "sqrt":
        configureSqrtScale(spec, scale, parameters), scale.rescale();
        break;

      case "symlog":
        configureSymlogScale(spec, scale, parameters), scale.rescale();
        break;

      case "time":
      case "utc":
        configureTimeScale(spec, scale, parameters), scale.rescale();
        break;

      case "quantize":
        configureQuantizeScale(spec, scale, parameters), scale.rescale();
        break;

      case "quantile":
        scale.rescale();
    }
}

exports.createScale = createScale, exports.parseScaleDomainRange = parseScaleDomainRange, 
exports.parseScaleConfig = parseScaleConfig, exports.configureScale = configureScale;
//# sourceMappingURL=scale.js.map
