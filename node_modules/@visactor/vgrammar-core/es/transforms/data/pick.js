import { field as getFieldAccessor } from "@visactor/vgrammar-util";

import { isString } from "@visactor/vutils";

import { fieldNames } from "../util/util";

function project(source, fields, as) {
    return fields.reduce(((res, field, index) => (res[as[index]] = field(source), res)), {});
}

export const transform = (options, upstreamData) => {
    const {fields: fields = []} = options, as = fieldNames(fields, options.as || []), fieldsAccessors = fields.map((field => isString(field) ? getFieldAccessor(field) : field));
    return fieldsAccessors.length ? upstreamData.map(((entry, index) => project(entry, fieldsAccessors, as))) : upstreamData.map(((entry, index) => ({})));
};
//# sourceMappingURL=pick.js.map
