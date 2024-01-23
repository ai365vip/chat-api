"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerCoordinate = exports.Coordinate = void 0;

const grammar_base_1 = require("./grammar-base"), coordinate_1 = require("../parse/coordinate"), factory_1 = require("../core/factory");

class Coordinate extends grammar_base_1.GrammarBase {
    constructor(view, coordinateType) {
        super(view), this.grammarType = "coordinate", this.spec = {
            type: "cartesian"
        }, this.spec.type = coordinateType, this.coordinate = (0, coordinate_1.createCoordinate)(coordinateType);
    }
    parse(spec) {
        return super.parse(spec), this.start(spec.start), this.end(spec.end), this.origin(spec.origin), 
        this.translate(spec.translate), this.rotate(spec.rotate), this.scale(spec.scale), 
        this.transpose(spec.transpose), this.commit(), this;
    }
    evaluate(upstream, parameters) {
        return this.coordinate && this.coordinate.type === this.spec.type || (this.coordinate = (0, 
        coordinate_1.createCoordinate)(this.spec.type)), (0, coordinate_1.configureCoordinate)(this.spec, this.coordinate, parameters), 
        this;
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

exports.Coordinate = Coordinate;

const registerCoordinate = () => {
    factory_1.Factory.registerGrammar("coordinate", Coordinate, "coordinates");
};

exports.registerCoordinate = registerCoordinate;
//# sourceMappingURL=coordinate.js.map
