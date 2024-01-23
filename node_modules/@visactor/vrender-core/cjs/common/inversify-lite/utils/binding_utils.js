"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: !0,
        value: v
    });
} : function(o, v) {
    o.default = v;
}), __importStar = this && this.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (null != mod) for (var k in mod) "default" !== k && Object.prototype.hasOwnProperty.call(mod, k) && __createBinding(result, mod, k);
    return __setModuleDefault(result, mod), result;
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getFactoryDetails = exports.ensureFullyBound = exports.multiBindToService = void 0;

const serialization_1 = require("./serialization"), ERROR_MSGS = __importStar(require("../constants/error_msgs")), literal_types_1 = require("../constants/literal_types"), factory_type_1 = require("./factory_type"), multiBindToService = container => service => (...types) => types.forEach((t => container.bind(t).toService(service)));

exports.multiBindToService = multiBindToService;

const ensureFullyBound = binding => {
    let boundValue = null;
    switch (binding.type) {
      case literal_types_1.BindingTypeEnum.ConstantValue:
      case literal_types_1.BindingTypeEnum.Function:
        boundValue = binding.cache;
        break;

      case literal_types_1.BindingTypeEnum.Constructor:
      case literal_types_1.BindingTypeEnum.Instance:
        boundValue = binding.implementationType;
        break;

      case literal_types_1.BindingTypeEnum.DynamicValue:
        boundValue = binding.dynamicValue;
        break;

      case literal_types_1.BindingTypeEnum.Provider:
        boundValue = binding.provider;
        break;

      case literal_types_1.BindingTypeEnum.Factory:
        boundValue = binding.factory;
    }
    if (null === boundValue) {
        const serviceIdentifierAsString = (0, serialization_1.getServiceIdentifierAsString)(binding.serviceIdentifier);
        throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifierAsString}`);
    }
};

exports.ensureFullyBound = ensureFullyBound;

const getFactoryDetails = binding => {
    switch (binding.type) {
      case literal_types_1.BindingTypeEnum.Factory:
        return {
            factory: binding.factory,
            factoryType: factory_type_1.FactoryType.Factory
        };

      case literal_types_1.BindingTypeEnum.Provider:
        return {
            factory: binding.provider,
            factoryType: factory_type_1.FactoryType.Provider
        };

      case literal_types_1.BindingTypeEnum.DynamicValue:
        return {
            factory: binding.dynamicValue,
            factoryType: factory_type_1.FactoryType.DynamicValue
        };

      default:
        throw new Error(`Unexpected factory type ${binding.type}`);
    }
};

exports.getFactoryDetails = getFactoryDetails;
//# sourceMappingURL=binding_utils.js.map
