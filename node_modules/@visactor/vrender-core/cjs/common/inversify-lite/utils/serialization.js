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
}), exports.getSymbolDescription = exports.circularDependencyToException = exports.listMetadataForTarget = exports.listRegisteredBindingsForServiceIdentifier = exports.getServiceIdentifierAsString = exports.getFunctionName = void 0;

const ERROR_MSGS = __importStar(require("../constants/error_msgs"));

function getServiceIdentifierAsString(serviceIdentifier) {
    if ("function" == typeof serviceIdentifier) {
        return serviceIdentifier.name;
    }
    if ("symbol" == typeof serviceIdentifier) return serviceIdentifier.toString();
    return serviceIdentifier;
}

function listRegisteredBindingsForServiceIdentifier(container, serviceIdentifier, getBindings) {
    let registeredBindingsList = "";
    const registeredBindings = getBindings(container, serviceIdentifier);
    return 0 !== registeredBindings.length && (registeredBindingsList = "\nRegistered bindings:", 
    registeredBindings.forEach((binding => {
        let name = "Object";
        null !== binding.implementationType && (name = getFunctionName(binding.implementationType)), 
        registeredBindingsList = `${registeredBindingsList}\n ${name}`, binding.constraint.metaData && (registeredBindingsList = `${registeredBindingsList} - ${binding.constraint.metaData}`);
    }))), registeredBindingsList;
}

function alreadyDependencyChain(request, serviceIdentifier) {
    return null !== request.parentRequest && (request.parentRequest.serviceIdentifier === serviceIdentifier || alreadyDependencyChain(request.parentRequest, serviceIdentifier));
}

function dependencyChainToString(request) {
    const stringArr = function _createStringArr(req, result = []) {
        const serviceIdentifier = getServiceIdentifierAsString(req.serviceIdentifier);
        return result.push(serviceIdentifier), null !== req.parentRequest ? _createStringArr(req.parentRequest, result) : result;
    }(request);
    return stringArr.reverse().join(" --\x3e ");
}

function circularDependencyToException(request) {
    request.childRequests.forEach((childRequest => {
        if (alreadyDependencyChain(childRequest, childRequest.serviceIdentifier)) {
            const services = dependencyChainToString(childRequest);
            throw new Error(`${ERROR_MSGS.CIRCULAR_DEPENDENCY} ${services}`);
        }
        circularDependencyToException(childRequest);
    }));
}

function listMetadataForTarget(serviceIdentifierString, target) {
    if (target.isTagged() || target.isNamed()) {
        let m = "";
        const namedTag = target.getNamedTag(), otherTags = target.getCustomTags();
        return null !== namedTag && (m += namedTag.toString() + "\n"), null !== otherTags && otherTags.forEach((tag => {
            m += tag.toString() + "\n";
        })), ` ${serviceIdentifierString}\n ${serviceIdentifierString} - ${m}`;
    }
    return ` ${serviceIdentifierString}`;
}

function getFunctionName(func) {
    if (func.name) return func.name;
    const name = func.toString(), match = name.match(/^function\s*([^\s(]+)/);
    return match ? match[1] : `Anonymous function: ${name}`;
}

function getSymbolDescription(symbol) {
    return symbol.toString().slice(7, -1);
}

exports.getServiceIdentifierAsString = getServiceIdentifierAsString, exports.listRegisteredBindingsForServiceIdentifier = listRegisteredBindingsForServiceIdentifier, 
exports.circularDependencyToException = circularDependencyToException, exports.listMetadataForTarget = listMetadataForTarget, 
exports.getFunctionName = getFunctionName, exports.getSymbolDescription = getSymbolDescription;
//# sourceMappingURL=serialization.js.map
