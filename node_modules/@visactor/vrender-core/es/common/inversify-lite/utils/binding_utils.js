import { getServiceIdentifierAsString } from "./serialization";

import * as ERROR_MSGS from "../constants/error_msgs";

import { BindingTypeEnum } from "../constants/literal_types";

import { FactoryType } from "./factory_type";

export const multiBindToService = container => service => (...types) => types.forEach((t => container.bind(t).toService(service)));

export const ensureFullyBound = binding => {
    let boundValue = null;
    switch (binding.type) {
      case BindingTypeEnum.ConstantValue:
      case BindingTypeEnum.Function:
        boundValue = binding.cache;
        break;

      case BindingTypeEnum.Constructor:
      case BindingTypeEnum.Instance:
        boundValue = binding.implementationType;
        break;

      case BindingTypeEnum.DynamicValue:
        boundValue = binding.dynamicValue;
        break;

      case BindingTypeEnum.Provider:
        boundValue = binding.provider;
        break;

      case BindingTypeEnum.Factory:
        boundValue = binding.factory;
    }
    if (null === boundValue) {
        const serviceIdentifierAsString = getServiceIdentifierAsString(binding.serviceIdentifier);
        throw new Error(`${ERROR_MSGS.INVALID_BINDING_TYPE} ${serviceIdentifierAsString}`);
    }
};

export const getFactoryDetails = binding => {
    switch (binding.type) {
      case BindingTypeEnum.Factory:
        return {
            factory: binding.factory,
            factoryType: FactoryType.Factory
        };

      case BindingTypeEnum.Provider:
        return {
            factory: binding.provider,
            factoryType: FactoryType.Provider
        };

      case BindingTypeEnum.DynamicValue:
        return {
            factory: binding.dynamicValue,
            factoryType: FactoryType.DynamicValue
        };

      default:
        throw new Error(`Unexpected factory type ${binding.type}`);
    }
};
//# sourceMappingURL=binding_utils.js.map
