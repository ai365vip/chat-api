"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.parseColor = exports.parseField = exports.isGrammar = exports.isSignal = exports.getGrammarOutput = exports.invokeParameterFunctionType = exports.invokeFunctionType = exports.isFunctionType = exports.parseFunctionType = exports.parseReference = void 0;

const vutils_1 = require("@visactor/vutils");

function parseReference(dependency, view) {
    return (0, vutils_1.array)(dependency).reduce(((refs, dep) => {
        const ref = (0, vutils_1.isString)(dep) ? view.getGrammarById(dep) : dep;
        return ref && refs.push(ref), refs;
    }), []);
}

function isSignalReferenceType(signal) {
    return !(0, vutils_1.isFunction)(signal) && !!(null == signal ? void 0 : signal.signal);
}

function isSignalFunctionType(signal) {
    return !(0, vutils_1.isFunction)(signal) && !!(null == signal ? void 0 : signal.callback);
}

function parseFunctionType(spec, view) {
    if ((0, vutils_1.isNil)(spec)) return [];
    if (isSignalReferenceType(spec)) {
        const signal = spec.signal;
        if ((0, vutils_1.isString)(signal)) return (0, vutils_1.array)(view.getGrammarById(signal));
        if ("signal" === (null == signal ? void 0 : signal.grammarType)) return [ signal ];
    } else if (isSignalFunctionType(spec)) return parseReference(spec.dependency, view);
    return [];
}

function isFunctionType(spec) {
    return (0, vutils_1.isFunction)(spec) || (null == spec ? void 0 : spec.signal) || !!(null == spec ? void 0 : spec.callback);
}

function invokeFunctionType(spec, parameters, datumOrGrammarInstance, element) {
    if ((0, vutils_1.isNil)(spec)) return spec;
    if ((0, vutils_1.isFunction)(spec)) return element ? spec.call(null, datumOrGrammarInstance, element, parameters) : spec.call(null, datumOrGrammarInstance, parameters);
    if (spec.signal) {
        const signal = spec.signal;
        return (0, vutils_1.isString)(signal) ? null == parameters ? void 0 : parameters[signal] : signal.output();
    }
    return spec.callback ? element ? spec.callback.call(null, datumOrGrammarInstance, element, parameters) : spec.callback.call(null, datumOrGrammarInstance, parameters) : spec;
}

function invokeParameterFunctionType(spec, parameters) {
    if ((0, vutils_1.isNil)(spec)) return spec;
    if ((0, vutils_1.isFunction)(spec)) return spec.call(null, parameters);
    if (spec.signal) {
        const signal = spec.signal;
        return (0, vutils_1.isString)(signal) ? null == parameters ? void 0 : parameters[signal] : signal.output();
    }
    return spec.callback ? spec.callback.call(null, parameters) : spec;
}

function getGrammarOutput(grammar, parameters) {
    return (0, exports.isGrammar)(grammar) ? grammar.output() : parameters[grammar];
}

function isSignal(obj) {
    return obj && (obj.signal || obj.callback);
}

exports.parseReference = parseReference, exports.parseFunctionType = parseFunctionType, 
exports.isFunctionType = isFunctionType, exports.invokeFunctionType = invokeFunctionType, 
exports.invokeParameterFunctionType = invokeParameterFunctionType, exports.getGrammarOutput = getGrammarOutput, 
exports.isSignal = isSignal;

const isGrammar = el => el && !(0, vutils_1.isNil)(el.grammarType);

exports.isGrammar = isGrammar;

const parseField = field => (0, vutils_1.isFunction)(field) ? field : datum => datum[field];

exports.parseField = parseField;

const parseColor = color => (0, vutils_1.isString)(color) && vutils_1.Color.parseColorString(color) ? color : null;

exports.parseColor = parseColor;
//# sourceMappingURL=util.js.map
