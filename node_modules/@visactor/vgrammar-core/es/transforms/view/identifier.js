import { isNil } from "@visactor/vutils";

const COUNTER_NAME = ":vGrammar_identifier:";

export const transform = (options, upstreamData, params, view) => {
    isNil(view[COUNTER_NAME]) && (view[COUNTER_NAME] = 0);
    let id = view[COUNTER_NAME];
    const as = options.as;
    return upstreamData.forEach((entry => {
        entry && isNil(entry[as]) && (id += 1, entry[as] = id);
    })), view[COUNTER_NAME] = id, id;
};
//# sourceMappingURL=identifier.js.map
