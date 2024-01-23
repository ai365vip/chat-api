"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.namedConstraint = void 0;

const meta_data_1 = require("../meta-data"), metadata_keys_1 = require("../metadata_keys"), taggedConstraint = key => value => {
    const constraint = request => {
        if (null == request) return !1;
        if (request.key === key && request.value === value) return !0;
        if (null == request.constructorArgsMetadata) return !1;
        const constructorArgsMetadata = request.constructorArgsMetadata;
        for (let i = 0; i < constructorArgsMetadata.length; i++) if (constructorArgsMetadata[i].key === key && constructorArgsMetadata[i].value === value) return !0;
        return !1;
    };
    return constraint.metaData = new meta_data_1.Metadata(key, value), constraint;
};

exports.namedConstraint = taggedConstraint(metadata_keys_1.NAMED_TAG);
//# sourceMappingURL=constraint_helpers.js.map
