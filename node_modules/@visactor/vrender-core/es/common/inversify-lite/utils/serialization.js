import * as ERROR_MSGS from "../constants/error_msgs";

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

export { getFunctionName, getServiceIdentifierAsString, listRegisteredBindingsForServiceIdentifier, listMetadataForTarget, circularDependencyToException, getSymbolDescription };
//# sourceMappingURL=serialization.js.map
