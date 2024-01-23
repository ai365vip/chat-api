export class Curve {
    getLength(direction) {
        return null != direction ? this.calcProjLength(direction) : (Number.isFinite(this.length) || (this.length = this.calcLength()), 
        this.length);
    }
}
//# sourceMappingURL=base.js.map
