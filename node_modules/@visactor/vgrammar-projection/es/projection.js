import { array, isFunction, isNil } from "@visactor/vutils";

import { error } from "@visactor/vgrammar-util";

import { projection, projectionProperties } from "./projections";

import { GrammarBase, parseFunctionType, invokeFunctionType } from "@visactor/vgrammar-core";

const Feature = "Feature", FeatureCollection = "FeatureCollection";

function featurize(f) {
    return f.type === FeatureCollection ? f.features : array(f).filter((d => !isNil(d))).map((d => d.type === Feature ? d : {
        type: Feature,
        geometry: d
    }));
}

export function collectGeoJSON(data) {
    const arrayData = array(data);
    return 1 === arrayData.length ? arrayData[0] : {
        type: FeatureCollection,
        features: arrayData.reduce(((a, f) => a.concat(featurize(f))), [])
    };
}

function create(type) {
    const constructor = projection((type || "mercator").toLowerCase());
    return constructor || error("Unrecognized projection type: " + type), constructor();
}

function set(proj, key, value) {
    isFunction(proj[key]) && proj[key](value);
}

const projectionOptions = projectionProperties.concat([ "pointRadius", "fit", "extent", "size" ]);

export function parseProjection(spec, view) {
    let refs = [];
    return spec ? (Object.keys(spec).forEach((key => {
        projectionOptions.includes(key) && (refs = refs.concat(parseFunctionType(spec[key], view)));
    })), refs) : refs;
}

export class Projection extends GrammarBase {
    constructor(view) {
        super(view), this.grammarType = "projection";
    }
    parse(spec) {
        return super.parse(spec), this.pointRadius(spec.pointRadius), this.size(spec.size), 
        this.extent(spec.extent), this.fit(spec.fit), this.configure(spec), this.commit(), 
        this;
    }
    pointRadius(pointRadius) {
        return isNil(this.spec.pointRadius) || this.detach(parseFunctionType(this.spec.pointRadius, this.view)), 
        this.spec.pointRadius = pointRadius, this.attach(parseFunctionType(pointRadius, this.view)), 
        this.commit(), this;
    }
    size(data) {
        return isNil(this.spec.size) || this.detach(parseFunctionType(this.spec.size, this.view)), 
        this.spec.size = data, this.attach(parseFunctionType(data, this.view)), this.commit(), 
        this;
    }
    extent(data) {
        return isNil(this.spec.extent) || this.detach(parseFunctionType(this.spec.extent, this.view)), 
        this.spec.extent = data, this.attach(parseFunctionType(data, this.view)), this.commit(), 
        this;
    }
    fit(data) {
        return isNil(this.spec.fit) || this.detach(parseFunctionType(this.spec.fit, this.view)), 
        this.spec.fit = data, this.attach(parseFunctionType(data, this.view)), this.commit(), 
        this;
    }
    configure(config) {
        return this.detach(parseProjection(this.spec, this.view)), isNil(config) ? this.spec = {
            type: this.spec.type,
            fit: this.spec.fit,
            extent: this.spec.extent,
            size: this.spec.size,
            pointRadius: this.spec.pointRadius
        } : (Object.assign(this.spec, config), this.attach(parseProjection(this.spec, this.view))), 
        this.commit(), this;
    }
    evaluate(upstream, parameters) {
        if (this.projection && this.projection.type === this.spec.type || (this.projection = create(this.spec.type), 
        this.projection.type = this.spec.type), projectionProperties.forEach((prop => {
            isNil(this.spec[prop]) || set(this.projection, prop, invokeFunctionType(this.spec[prop], parameters, projection));
        })), isNil(this.spec.pointRadius) || this.projection.path.pointRadius(invokeFunctionType(this.spec.pointRadius, parameters, projection)), 
        !(isNil(this.spec.fit) || isNil(this.spec.extent) && isNil(this.spec.size))) {
            const data = collectGeoJSON(invokeFunctionType(this.spec.fit, parameters, projection));
            this.spec.extent ? this.projection.fitExtent(invokeFunctionType(this.spec.extent, parameters, projection), data) : this.spec.size && this.projection.fitSize(invokeFunctionType(this.spec.size, parameters, projection), data);
        }
        return this.projection;
    }
    output() {
        return this.projection;
    }
}
//# sourceMappingURL=projection.js.map