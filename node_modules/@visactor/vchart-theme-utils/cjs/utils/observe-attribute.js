"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.observeAttribute = void 0;

const observeAttribute = (element, attribute, callback) => {
    new MutationObserver((mutations => {
        mutations.forEach((mutation => {
            mutation.attributeName === attribute && callback(mutation);
        }));
    })).observe(element, {
        attributes: !0
    });
};

exports.observeAttribute = observeAttribute;
//# sourceMappingURL=observe-attribute.js.map