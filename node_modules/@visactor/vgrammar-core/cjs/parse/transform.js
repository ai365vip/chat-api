"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.parseTransformSpec = void 0;

const vutils_1 = require("@visactor/vutils"), factory_1 = require("../core/factory"), util_1 = require("./util"), parseSimpleOptionValue = (key, transformSpecValue, view) => {
    var _a;
    if ("callback" === key && (0, vutils_1.isFunction)(transformSpecValue)) return {
        references: [],
        value: {
            callback: transformSpecValue,
            dependency: []
        }
    };
    if (!(0, vutils_1.isNil)(transformSpecValue.data)) {
        const grammarInstance = view.getDataById(transformSpecValue.data);
        return {
            references: [ grammarInstance ],
            value: grammarInstance
        };
    }
    if (!(0, vutils_1.isNil)(transformSpecValue.customized)) {
        const grammarInstance = view.getCustomizedById(transformSpecValue.customized);
        return {
            references: [ grammarInstance ],
            value: grammarInstance
        };
    }
    if (!(0, vutils_1.isNil)(transformSpecValue.scale)) {
        const grammarInstance = view.getScaleById(transformSpecValue.scale);
        return {
            references: [ grammarInstance ],
            value: grammarInstance
        };
    }
    if ((0, util_1.isSignal)(transformSpecValue)) {
        const references = (0, util_1.parseFunctionType)(transformSpecValue, view);
        return {
            references: references,
            value: transformSpecValue.callback ? {
                value: transformSpecValue.callback,
                dependency: references
            } : null !== (_a = null == references ? void 0 : references[0]) && void 0 !== _a ? _a : transformSpecValue
        };
    }
    return {
        value: transformSpecValue
    };
}, parseTransformOption = (key, transformSpecValue, view) => {
    if ((0, vutils_1.isNil)(transformSpecValue)) return {
        value: transformSpecValue
    };
    if ((0, vutils_1.isArray)(transformSpecValue)) {
        const values = transformSpecValue.map((v => parseSimpleOptionValue(key, v, view)));
        return {
            references: values.reduce(((res, val) => (val.references && res.concat(val.references), 
            res)), []),
            value: values.map((entry => entry.value))
        };
    }
    return parseSimpleOptionValue(key, transformSpecValue, view);
}, parseTransform = (transformSpec, view) => {
    const transformDef = factory_1.Factory.getTransform(transformSpec.type);
    if (!transformDef) return;
    const options = {};
    let references = [];
    return Object.keys(transformSpec).forEach((specKey => {
        var _a;
        if ("type" === specKey) return;
        const specValue = transformSpec[specKey];
        if ("dependency" === specKey) return void ((null == specValue ? void 0 : specValue.length) && (references = references.concat((0, 
        util_1.parseReference)(specValue, view))));
        const res = parseTransformOption(specKey, specValue, view);
        res && ((null === (_a = res.references) || void 0 === _a ? void 0 : _a.length) && (references = references.concat(res.references)), 
        options[specKey] = res.value);
    })), {
        markPhase: transformDef.markPhase,
        transform: transformDef.transform,
        canProgressive: transformDef.canProgressive,
        type: transformDef.type,
        options: options,
        references: references
    };
}, parseTransformSpec = (spec, view) => {
    if (null == spec ? void 0 : spec.length) {
        const transforms = [];
        let refs = [];
        return spec.forEach((transformSpec => {
            var _a;
            const transform = parseTransform(transformSpec, view);
            transform && ((null === (_a = transform.references) || void 0 === _a ? void 0 : _a.length) && (refs = refs.concat(transform.references)), 
            transforms.push(transform));
        })), {
            transforms: transforms,
            refs: refs
        };
    }
    return null;
};

exports.parseTransformSpec = parseTransformSpec;
//# sourceMappingURL=transform.js.map
