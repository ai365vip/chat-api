import { GrammarBase } from "./grammar-base";

import { configureCoordinate, createCoordinate } from "../parse/coordinate";

import { Factory } from "../core/factory";

export class Coordinate extends GrammarBase {
    constructor(view, coordinateType) {
        super(view), this.grammarType = "coordinate", this.spec = {
            type: "cartesian"
        }, this.spec.type = coordinateType, this.coordinate = createCoordinate(coordinateType);
    }
    parse(spec) {
        return super.parse(spec), this.start(spec.start), this.end(spec.end), this.origin(spec.origin), 
        this.translate(spec.translate), this.rotate(spec.rotate), this.scale(spec.scale), 
        this.transpose(spec.transpose), this.commit(), this;
    }
    evaluate(upstream, parameters) {
        return this.coordinate && this.coordinate.type === this.spec.type || (this.coordinate = createCoordinate(this.spec.type)), 
        configureCoordinate(this.spec, this.coordinate, parameters), this;
    }
    output() {
        return this.coordinate;
    }
    start(start) {
        return this.setFunctionSpec(start, "start");
    }
    end(end) {
        return this.setFunctionSpec(end, "end");
    }
    origin(origin) {
        return this.setFunctionSpec(origin, "origin");
    }
    translate(offset) {
        return this.setFunctionSpec(offset, "translate");
    }
    rotate(angle) {
        return this.setFunctionSpec(angle, "rotate");
    }
    scale(ratio) {
        return this.setFunctionSpec(ratio, "scale");
    }
    transpose(isTransposed) {
        return this.setFunctionSpec(isTransposed, "transpose");
    }
    reuse(grammar) {
        return grammar.grammarType !== this.grammarType || (this.coordinate = grammar.output()), 
        this;
    }
    clear() {
        super.clear(), this.coordinate = null;
    }
}

export const registerCoordinate = () => {
    Factory.registerGrammar("coordinate", Coordinate, "coordinates");
};
//# sourceMappingURL=coordinate.js.map
