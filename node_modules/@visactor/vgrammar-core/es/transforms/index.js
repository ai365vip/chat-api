import { transform as binTransform } from "./data/bin";

import { transform as contourTransform } from "./data/contour";

import { transform as sortTransform } from "./data/sort";

import { transform as filterTransform } from "./data/filter";

import { transform as mapTransform } from "./data/map";

import { transform as kdeTransform } from "./data/kde";

import { transform as joinTransform } from "./data/join";

import { transform as pickTransform } from "./data/pick";

import { transform as rangeTransform } from "./data/range";

import { transform as stackTransform } from "./data/stack";

import { transform as foldTransform } from "./data/fold";

import { transform as unfoldTransform } from "./data/unfold";

import { transform as funnelTransform } from "./data/funnel";

import { transform as pieTransform } from "./data/pie";

import { transform as circularRelationTransform } from "./data/circular-relation";

import { transform as sampleTransform } from "./data/sampling";

import { transform as markoverlapTransform } from "./mark/mark-overlap";

import { transform as identifierTransform } from "./view/identifier";

import { transform as dodgeTransform } from "./mark/dodge";

import { transform as jitterTransform, jitterX as jitterXTransform, jitterY as jitterYTransform } from "./mark/jitter";

import { symmetry as symmetryTransform } from "./mark/symmetry";

import { Factory } from "../core/factory";

export const registerBinTransform = () => {
    Factory.registerTransform("bin", {
        transform: binTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerContourTransform = () => {
    Factory.registerTransform("contour", {
        transform: contourTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerSortTransform = () => {
    Factory.registerTransform("sort", {
        transform: sortTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerFilterTransform = () => {
    Factory.registerTransform("filter", {
        transform: filterTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerJoinTransform = () => {
    Factory.registerTransform("join", {
        transform: joinTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerKdeTransform = () => {
    Factory.registerTransform("kde", {
        transform: kdeTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerMapTransform = () => {
    Factory.registerTransform("map", {
        transform: mapTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerPickTransform = () => {
    Factory.registerTransform("pick", {
        transform: pickTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerRangeTransform = () => {
    Factory.registerTransform("range", {
        transform: rangeTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerStackTransform = () => {
    Factory.registerTransform("stack", {
        transform: stackTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerFunnelTransform = () => {
    Factory.registerTransform("funnel", {
        transform: funnelTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerPieTransform = () => {
    Factory.registerTransform("pie", {
        transform: pieTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerCircularRelationTransform = () => {
    Factory.registerTransform("circularRelation", {
        transform: circularRelationTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerFoldTransform = () => {
    Factory.registerTransform("fold", {
        transform: foldTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerUnfoldTransform = () => {
    Factory.registerTransform("unfold", {
        transform: unfoldTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerIdentifierTransform = () => {
    Factory.registerTransform("identifier", {
        transform: identifierTransform,
        markPhase: "beforeJoin"
    }, !0);
};

export const registerSampleTransform = () => {
    Factory.registerTransform("sampling", {
        transform: sampleTransform,
        markPhase: "afterEncode"
    }, !0);
};

export const registerMarkOverlapTransform = () => {
    Factory.registerTransform("markoverlap", {
        transform: markoverlapTransform,
        markPhase: "afterEncode"
    }, !0);
};

export const registerDodgeTransform = () => {
    Factory.registerTransform("dodge", {
        transform: dodgeTransform,
        markPhase: "afterEncodeItems"
    }, !0);
};

export const registerJitterTransform = () => {
    Factory.registerTransform("jitter", {
        transform: jitterTransform,
        markPhase: "afterEncodeItems"
    }, !0);
};

export const registerJitterXTransform = () => {
    Factory.registerTransform("jitterX", {
        transform: jitterXTransform,
        markPhase: "afterEncodeItems"
    }, !0);
};

export const registerJitterYTransform = () => {
    Factory.registerTransform("jitterY", {
        transform: jitterYTransform,
        markPhase: "afterEncodeItems"
    }, !0);
};

export const registerSymmetryTransform = () => {
    Factory.registerTransform("symmetry", {
        transform: symmetryTransform,
        markPhase: "afterEncodeItems"
    }, !0);
};
//# sourceMappingURL=index.js.map
