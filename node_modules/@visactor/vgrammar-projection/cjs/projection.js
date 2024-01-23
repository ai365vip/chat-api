"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Projection = exports.parseProjection = exports.collectGeoJSON = void 0;

const vutils_1 = require("@visactor/vutils"), vgrammar_util_1 = require("@visactor/vgrammar-util"), projections_1 = require("./projections"), vgrammar_core_1 = require("@visactor/vgrammar-core"), Feature = "Feature", FeatureCollection = "FeatureCollection";

function featurize(f) {
    return f.type === FeatureCollection ? f.features : (0, vutils_1.array)(f).filter((d => !(0, 
    vutils_1.isNil)(d))).map((d => d.type === Feature ? d : {
        type: Feature,
        geometry: d
    }));
}

function collectGeoJSON(data) {
    const arrayData = (0, vutils_1.array)(data);
    return 1 === arrayData.length ? arrayData[0] : {
        type: FeatureCollection,
        features: arrayData.reduce(((a, f) => a.concat(featurize(f))), [])
    };
}

function create(type) {
    const constructor = (0, projections_1.projection)((type || "mercator").toLowerCase());
    return constructor || (0, vgrammar_util_1.error)("Unrecognized projection type: " + type), 
    constructor();
}

function set(proj, key, value) {
    (0, vutils_1.isFunction)(proj[key]) && proj[key](value);
}

exports.collectGeoJSON = collectGeoJSON;

const projectionOptions = projections_1.projectionProperties.concat([ "pointRadius", "fit", "extent", "size" ]);

function parseProjection(spec, view) {
    let refs = [];
    return spec ? (Object.keys(spec).forEach((key => {
        projectionOptions.includes(key) && (refs = refs.concat((0, vgrammar_core_1.parseFunctionType)(spec[key], view)));
    })), refs) : refs;
}

exports.parseProjection = parseProjection;

class Projection extends vgrammar_core_1.GrammarBase {
    constructor(view) {
        super(view), this.grammarType = "projection";
    }
    parse(spec) {
        return super.parse(spec), this.pointRadius(spec.pointRadius), this.size(spec.size), 
        this.extent(spec.extent), this.fit(spec.fit), this.configure(spec), this.commit(), 
        this;
    }
    pointRadius(pointRadius) {
        return (0, vutils_1.isNil)(this.spec.pointRadius) || this.detach((0, vgrammar_core_1.parseFunctionType)(this.spec.pointRadius, this.view)), 
        this.spec.pointRadius = pointRadius, this.attach((0, vgrammar_core_1.parseFunctionType)(pointRadius, this.view)), 
        this.commit(), this;
    }
    size(data) {
        return (0, vutils_1.isNil)(this.spec.size) || this.detach((0, vgrammar_core_1.parseFunctionType)(this.spec.size, this.view)), 
        this.spec.size = data, this.attach((0, vgrammar_core_1.parseFunctionType)(data, this.view)), 
        this.commit(), this;
    }
    extent(data) {
        return (0, vutils_1.isNil)(this.spec.extent) || this.detach((0, vgrammar_core_1.parseFunctionType)(this.spec.extent, this.view)), 
        this.spec.extent = data, this.attach((0, vgrammar_core_1.parseFunctionType)(data, this.view)), 
        this.commit(), this;
    }
    fit(data) {
        return (0, vutils_1.isNil)(this.spec.fit) || this.detach((0, vgrammar_core_1.parseFunctionType)(this.spec.fit, this.view)), 
        this.spec.fit = data, this.attach((0, vgrammar_core_1.parseFunctionType)(data, this.view)), 
        this.commit(), this;
    }
    configure(config) {
        return this.detach(parseProjection(this.spec, this.view)), (0, vutils_1.isNil)(config) ? this.spec = {
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
        this.projection.type = this.spec.type), projections_1.projectionProperties.forEach((prop => {
            (0, vutils_1.isNil)(this.spec[prop]) || set(this.projection, prop, (0, vgrammar_core_1.invokeFunctionType)(this.spec[prop], parameters, projections_1.projection));
        })), (0, vutils_1.isNil)(this.spec.pointRadius) || this.projection.path.pointRadius((0, 
        vgrammar_core_1.invokeFunctionType)(this.spec.pointRadius, parameters, projections_1.projection)), 
        !((0, vutils_1.isNil)(this.spec.fit) || (0, vutils_1.isNil)(this.spec.extent) && (0, 
        vutils_1.isNil)(this.spec.size))) {
            const data = collectGeoJSON((0, vgrammar_core_1.invokeFunctionType)(this.spec.fit, parameters, projections_1.projection));
            this.spec.extent ? this.projection.fitExtent((0, vgrammar_core_1.invokeFunctionType)(this.spec.extent, parameters, projections_1.projection), data) : this.spec.size && this.projection.fitSize((0, 
            vgrammar_core_1.invokeFunctionType)(this.spec.size, parameters, projections_1.projection), data);
        }
        return this.projection;
    }
    output() {
        return this.projection;
    }
}

exports.Projection = Projection;
//# sourceMappingURL=projection.js.map