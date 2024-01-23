import { ScaleEnum } from "./type";

export const implicit = Symbol("implicit");

export class IdentityScale {
    constructor() {
        this.type = ScaleEnum.Identity;
    }
    specified(_) {
        var _a;
        return _ ? (this._specified = Object.assign(null !== (_a = this._specified) && void 0 !== _a ? _a : {}, _), 
        this) : Object.assign({}, this._specified);
    }
    _getSpecifiedValue(input) {
        if (this._specified) return this._specified[input];
    }
    clone() {
        return (new IdentityScale).unknown(this._unknown).domain(this._domain).specified(this._specified);
    }
    scale(d) {
        const key = `${d}`, special = this._getSpecifiedValue(key);
        return void 0 !== special ? special : this._unknown !== implicit && this._domain && !this._domain.includes(d) ? this._unknown : d;
    }
    invert(d) {
        return d;
    }
    domain(_) {
        return _ ? (this._domain = _, this) : this._domain ? this._domain.slice() : void 0;
    }
    range(_) {
        return _ ? this : this._domain ? this._domain.slice() : void 0;
    }
    unknown(_) {
        return arguments.length ? (this._unknown = _, this) : this._unknown;
    }
}
//# sourceMappingURL=identity-scale.js.map