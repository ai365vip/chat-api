import { isNil } from "@visactor/vutils";

export const accessor = (fn, fields, name) => (fn.fields = fields || [], fn.fname = name, 
fn);

export function accessorName(fn) {
    return isNil(fn) ? null : fn.fname;
}

export function accessorFields(fn) {
    return isNil(fn) ? null : fn.fields;
}