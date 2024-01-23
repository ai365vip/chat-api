"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.propertyEventDecorator = void 0;

const metadata_1 = require("../planning/metadata"), Reflect_metadata_1 = __importDefault(require("../../Reflect-metadata"));

function propertyEventDecorator(eventKey, errorMessage) {
    return () => (target, propertyKey) => {
        const metadata = new metadata_1.Metadata(eventKey, propertyKey);
        if (Reflect_metadata_1.default.hasOwnMetadata(eventKey, target.constructor)) throw new Error(errorMessage);
        Reflect_metadata_1.default.defineMetadata(eventKey, metadata, target.constructor);
    };
}

exports.propertyEventDecorator = propertyEventDecorator;
//# sourceMappingURL=property_event_decorator.js.map
