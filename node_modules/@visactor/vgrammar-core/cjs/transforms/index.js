"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerSymmetryTransform = exports.registerJitterYTransform = exports.registerJitterXTransform = exports.registerJitterTransform = exports.registerDodgeTransform = exports.registerMarkOverlapTransform = exports.registerSampleTransform = exports.registerIdentifierTransform = exports.registerUnfoldTransform = exports.registerFoldTransform = exports.registerCircularRelationTransform = exports.registerPieTransform = exports.registerFunnelTransform = exports.registerStackTransform = exports.registerRangeTransform = exports.registerPickTransform = exports.registerMapTransform = exports.registerKdeTransform = exports.registerJoinTransform = exports.registerFilterTransform = exports.registerSortTransform = exports.registerContourTransform = exports.registerBinTransform = void 0;

const bin_1 = require("./data/bin"), contour_1 = require("./data/contour"), sort_1 = require("./data/sort"), filter_1 = require("./data/filter"), map_1 = require("./data/map"), kde_1 = require("./data/kde"), join_1 = require("./data/join"), pick_1 = require("./data/pick"), range_1 = require("./data/range"), stack_1 = require("./data/stack"), fold_1 = require("./data/fold"), unfold_1 = require("./data/unfold"), funnel_1 = require("./data/funnel"), pie_1 = require("./data/pie"), circular_relation_1 = require("./data/circular-relation"), sampling_1 = require("./data/sampling"), mark_overlap_1 = require("./mark/mark-overlap"), identifier_1 = require("./view/identifier"), dodge_1 = require("./mark/dodge"), jitter_1 = require("./mark/jitter"), symmetry_1 = require("./mark/symmetry"), factory_1 = require("../core/factory"), registerBinTransform = () => {
    factory_1.Factory.registerTransform("bin", {
        transform: bin_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerBinTransform = registerBinTransform;

const registerContourTransform = () => {
    factory_1.Factory.registerTransform("contour", {
        transform: contour_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerContourTransform = registerContourTransform;

const registerSortTransform = () => {
    factory_1.Factory.registerTransform("sort", {
        transform: sort_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerSortTransform = registerSortTransform;

const registerFilterTransform = () => {
    factory_1.Factory.registerTransform("filter", {
        transform: filter_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerFilterTransform = registerFilterTransform;

const registerJoinTransform = () => {
    factory_1.Factory.registerTransform("join", {
        transform: join_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerJoinTransform = registerJoinTransform;

const registerKdeTransform = () => {
    factory_1.Factory.registerTransform("kde", {
        transform: kde_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerKdeTransform = registerKdeTransform;

const registerMapTransform = () => {
    factory_1.Factory.registerTransform("map", {
        transform: map_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerMapTransform = registerMapTransform;

const registerPickTransform = () => {
    factory_1.Factory.registerTransform("pick", {
        transform: pick_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerPickTransform = registerPickTransform;

const registerRangeTransform = () => {
    factory_1.Factory.registerTransform("range", {
        transform: range_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerRangeTransform = registerRangeTransform;

const registerStackTransform = () => {
    factory_1.Factory.registerTransform("stack", {
        transform: stack_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerStackTransform = registerStackTransform;

const registerFunnelTransform = () => {
    factory_1.Factory.registerTransform("funnel", {
        transform: funnel_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerFunnelTransform = registerFunnelTransform;

const registerPieTransform = () => {
    factory_1.Factory.registerTransform("pie", {
        transform: pie_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerPieTransform = registerPieTransform;

const registerCircularRelationTransform = () => {
    factory_1.Factory.registerTransform("circularRelation", {
        transform: circular_relation_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerCircularRelationTransform = registerCircularRelationTransform;

const registerFoldTransform = () => {
    factory_1.Factory.registerTransform("fold", {
        transform: fold_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerFoldTransform = registerFoldTransform;

const registerUnfoldTransform = () => {
    factory_1.Factory.registerTransform("unfold", {
        transform: unfold_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerUnfoldTransform = registerUnfoldTransform;

const registerIdentifierTransform = () => {
    factory_1.Factory.registerTransform("identifier", {
        transform: identifier_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerIdentifierTransform = registerIdentifierTransform;

const registerSampleTransform = () => {
    factory_1.Factory.registerTransform("sampling", {
        transform: sampling_1.transform,
        markPhase: "afterEncode"
    }, !0);
};

exports.registerSampleTransform = registerSampleTransform;

const registerMarkOverlapTransform = () => {
    factory_1.Factory.registerTransform("markoverlap", {
        transform: mark_overlap_1.transform,
        markPhase: "afterEncode"
    }, !0);
};

exports.registerMarkOverlapTransform = registerMarkOverlapTransform;

const registerDodgeTransform = () => {
    factory_1.Factory.registerTransform("dodge", {
        transform: dodge_1.transform,
        markPhase: "afterEncodeItems"
    }, !0);
};

exports.registerDodgeTransform = registerDodgeTransform;

const registerJitterTransform = () => {
    factory_1.Factory.registerTransform("jitter", {
        transform: jitter_1.transform,
        markPhase: "afterEncodeItems"
    }, !0);
};

exports.registerJitterTransform = registerJitterTransform;

const registerJitterXTransform = () => {
    factory_1.Factory.registerTransform("jitterX", {
        transform: jitter_1.jitterX,
        markPhase: "afterEncodeItems"
    }, !0);
};

exports.registerJitterXTransform = registerJitterXTransform;

const registerJitterYTransform = () => {
    factory_1.Factory.registerTransform("jitterY", {
        transform: jitter_1.jitterY,
        markPhase: "afterEncodeItems"
    }, !0);
};

exports.registerJitterYTransform = registerJitterYTransform;

const registerSymmetryTransform = () => {
    factory_1.Factory.registerTransform("symmetry", {
        transform: symmetry_1.symmetry,
        markPhase: "afterEncodeItems"
    }, !0);
};

exports.registerSymmetryTransform = registerSymmetryTransform;
//# sourceMappingURL=index.js.map
