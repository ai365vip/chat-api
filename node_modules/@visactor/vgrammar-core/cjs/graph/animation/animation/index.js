"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerGrowRadiusInAnimation = exports.registerGrowAngleOutAnimation = exports.registerGrowAngleInAnimation = exports.registerGrowPointsYOutAnimation = exports.registerGrowPointsYInAnimation = exports.registerGrowPointsXOutAnimation = exports.registerGrowPointsXInAnimation = exports.registerGrowPointsOutAnimation = exports.registerGrowPointsInAnimation = exports.registerGrowIntervalOutAnimation = exports.registerGrowIntervalInAnimation = exports.registerGrowWidthOutAnimation = exports.registerGrowWidthInAnimation = exports.registerGrowHeightOutAnimation = exports.registerGrowHeightInAnimation = exports.registerGrowCenterOutAnimation = exports.registerGrowCenterInAnimation = exports.registerFadeOutAnimation = exports.registerFadeInAnimation = exports.registerClipOutAnimation = exports.registerClipInAnimation = exports.update = exports.growIntervalOut = exports.growIntervalIn = exports.growPointsYOut = exports.growPointsYIn = exports.growPointsXOut = exports.growPointsXIn = exports.growPointsOut = exports.growPointsIn = exports.growRadiusOut = exports.growRadiusIn = exports.growAngleOut = exports.growAngleIn = exports.growHeightOut = exports.growHeightIn = exports.growWidthOut = exports.growWidthIn = exports.growCenterOut = exports.growCenterIn = exports.rotateOut = exports.rotateIn = exports.scaleOut = exports.scaleIn = exports.moveOut = exports.moveIn = exports.fadeOut = exports.fadeIn = exports.clipOut = exports.clipIn = void 0, 
exports.registerUpdateAnimation = exports.registerRotateOutAnimation = exports.registerRotateInAnimation = exports.registerScaleOutAnimation = exports.registerScaleInAnimation = exports.registerMoveOutAnimation = exports.registerMoveInAnimation = exports.registerGrowRadiusOutAnimation = void 0;

const clip_1 = require("./clip");

Object.defineProperty(exports, "clipIn", {
    enumerable: !0,
    get: function() {
        return clip_1.clipIn;
    }
}), Object.defineProperty(exports, "clipOut", {
    enumerable: !0,
    get: function() {
        return clip_1.clipOut;
    }
});

const fade_1 = require("./fade");

Object.defineProperty(exports, "fadeIn", {
    enumerable: !0,
    get: function() {
        return fade_1.fadeIn;
    }
}), Object.defineProperty(exports, "fadeOut", {
    enumerable: !0,
    get: function() {
        return fade_1.fadeOut;
    }
});

const grow_cartesian_1 = require("./grow-cartesian");

Object.defineProperty(exports, "growCenterIn", {
    enumerable: !0,
    get: function() {
        return grow_cartesian_1.growCenterIn;
    }
}), Object.defineProperty(exports, "growCenterOut", {
    enumerable: !0,
    get: function() {
        return grow_cartesian_1.growCenterOut;
    }
}), Object.defineProperty(exports, "growHeightIn", {
    enumerable: !0,
    get: function() {
        return grow_cartesian_1.growHeightIn;
    }
}), Object.defineProperty(exports, "growHeightOut", {
    enumerable: !0,
    get: function() {
        return grow_cartesian_1.growHeightOut;
    }
}), Object.defineProperty(exports, "growWidthIn", {
    enumerable: !0,
    get: function() {
        return grow_cartesian_1.growWidthIn;
    }
}), Object.defineProperty(exports, "growWidthOut", {
    enumerable: !0,
    get: function() {
        return grow_cartesian_1.growWidthOut;
    }
});

const grow_polar_1 = require("./grow-polar");

Object.defineProperty(exports, "growAngleIn", {
    enumerable: !0,
    get: function() {
        return grow_polar_1.growAngleIn;
    }
}), Object.defineProperty(exports, "growAngleOut", {
    enumerable: !0,
    get: function() {
        return grow_polar_1.growAngleOut;
    }
}), Object.defineProperty(exports, "growRadiusIn", {
    enumerable: !0,
    get: function() {
        return grow_polar_1.growRadiusIn;
    }
}), Object.defineProperty(exports, "growRadiusOut", {
    enumerable: !0,
    get: function() {
        return grow_polar_1.growRadiusOut;
    }
});

const grow_points_1 = require("./grow-points");

Object.defineProperty(exports, "growPointsIn", {
    enumerable: !0,
    get: function() {
        return grow_points_1.growPointsIn;
    }
}), Object.defineProperty(exports, "growPointsOut", {
    enumerable: !0,
    get: function() {
        return grow_points_1.growPointsOut;
    }
}), Object.defineProperty(exports, "growPointsXIn", {
    enumerable: !0,
    get: function() {
        return grow_points_1.growPointsXIn;
    }
}), Object.defineProperty(exports, "growPointsXOut", {
    enumerable: !0,
    get: function() {
        return grow_points_1.growPointsXOut;
    }
}), Object.defineProperty(exports, "growPointsYIn", {
    enumerable: !0,
    get: function() {
        return grow_points_1.growPointsYIn;
    }
}), Object.defineProperty(exports, "growPointsYOut", {
    enumerable: !0,
    get: function() {
        return grow_points_1.growPointsYOut;
    }
});

const grow_interval_1 = require("./grow-interval");

Object.defineProperty(exports, "growIntervalIn", {
    enumerable: !0,
    get: function() {
        return grow_interval_1.growIntervalIn;
    }
}), Object.defineProperty(exports, "growIntervalOut", {
    enumerable: !0,
    get: function() {
        return grow_interval_1.growIntervalOut;
    }
});

const move_1 = require("./move");

Object.defineProperty(exports, "moveIn", {
    enumerable: !0,
    get: function() {
        return move_1.moveIn;
    }
}), Object.defineProperty(exports, "moveOut", {
    enumerable: !0,
    get: function() {
        return move_1.moveOut;
    }
});

const scale_1 = require("./scale");

Object.defineProperty(exports, "scaleIn", {
    enumerable: !0,
    get: function() {
        return scale_1.scaleIn;
    }
}), Object.defineProperty(exports, "scaleOut", {
    enumerable: !0,
    get: function() {
        return scale_1.scaleOut;
    }
});

const update_1 = require("./update");

Object.defineProperty(exports, "update", {
    enumerable: !0,
    get: function() {
        return update_1.update;
    }
});

const rotate_1 = require("./rotate");

Object.defineProperty(exports, "rotateIn", {
    enumerable: !0,
    get: function() {
        return rotate_1.rotateIn;
    }
}), Object.defineProperty(exports, "rotateOut", {
    enumerable: !0,
    get: function() {
        return rotate_1.rotateOut;
    }
});

const factory_1 = require("../../../core/factory"), registerClipInAnimation = () => {
    factory_1.Factory.registerAnimationType("clipIn", clip_1.clipIn);
};

exports.registerClipInAnimation = registerClipInAnimation;

const registerClipOutAnimation = () => {
    factory_1.Factory.registerAnimationType("clipOut", clip_1.clipOut);
};

exports.registerClipOutAnimation = registerClipOutAnimation;

const registerFadeInAnimation = () => {
    factory_1.Factory.registerAnimationType("fadeIn", fade_1.fadeIn);
};

exports.registerFadeInAnimation = registerFadeInAnimation;

const registerFadeOutAnimation = () => {
    factory_1.Factory.registerAnimationType("fadeOut", fade_1.fadeOut);
};

exports.registerFadeOutAnimation = registerFadeOutAnimation;

const registerGrowCenterInAnimation = () => {
    factory_1.Factory.registerAnimationType("growCenterIn", grow_cartesian_1.growCenterIn);
};

exports.registerGrowCenterInAnimation = registerGrowCenterInAnimation;

const registerGrowCenterOutAnimation = () => {
    factory_1.Factory.registerAnimationType("growCenterOut", grow_cartesian_1.growCenterOut);
};

exports.registerGrowCenterOutAnimation = registerGrowCenterOutAnimation;

const registerGrowHeightInAnimation = () => {
    factory_1.Factory.registerAnimationType("growHeightIn", grow_cartesian_1.growHeightIn);
};

exports.registerGrowHeightInAnimation = registerGrowHeightInAnimation;

const registerGrowHeightOutAnimation = () => {
    factory_1.Factory.registerAnimationType("growHeightOut", grow_cartesian_1.growHeightOut);
};

exports.registerGrowHeightOutAnimation = registerGrowHeightOutAnimation;

const registerGrowWidthInAnimation = () => {
    factory_1.Factory.registerAnimationType("growWidthIn", grow_cartesian_1.growWidthIn);
};

exports.registerGrowWidthInAnimation = registerGrowWidthInAnimation;

const registerGrowWidthOutAnimation = () => {
    factory_1.Factory.registerAnimationType("growWidthOut", grow_cartesian_1.growWidthOut);
};

exports.registerGrowWidthOutAnimation = registerGrowWidthOutAnimation;

const registerGrowIntervalInAnimation = () => {
    factory_1.Factory.registerAnimationType("growIntervalIn", grow_interval_1.growIntervalIn);
};

exports.registerGrowIntervalInAnimation = registerGrowIntervalInAnimation;

const registerGrowIntervalOutAnimation = () => {
    factory_1.Factory.registerAnimationType("growIntervalOut", grow_interval_1.growIntervalOut);
};

exports.registerGrowIntervalOutAnimation = registerGrowIntervalOutAnimation;

const registerGrowPointsInAnimation = () => {
    factory_1.Factory.registerAnimationType("growPointsIn", grow_points_1.growPointsIn);
};

exports.registerGrowPointsInAnimation = registerGrowPointsInAnimation;

const registerGrowPointsOutAnimation = () => {
    factory_1.Factory.registerAnimationType("growPointsOut", grow_points_1.growPointsOut);
};

exports.registerGrowPointsOutAnimation = registerGrowPointsOutAnimation;

const registerGrowPointsXInAnimation = () => {
    factory_1.Factory.registerAnimationType("growPointsXIn", grow_points_1.growPointsXIn);
};

exports.registerGrowPointsXInAnimation = registerGrowPointsXInAnimation;

const registerGrowPointsXOutAnimation = () => {
    factory_1.Factory.registerAnimationType("growPointsXOut", grow_points_1.growPointsXOut);
};

exports.registerGrowPointsXOutAnimation = registerGrowPointsXOutAnimation;

const registerGrowPointsYInAnimation = () => {
    factory_1.Factory.registerAnimationType("growPointsYIn", grow_points_1.growPointsYIn);
};

exports.registerGrowPointsYInAnimation = registerGrowPointsYInAnimation;

const registerGrowPointsYOutAnimation = () => {
    factory_1.Factory.registerAnimationType("growPointsYOut", grow_points_1.growPointsYOut);
};

exports.registerGrowPointsYOutAnimation = registerGrowPointsYOutAnimation;

const registerGrowAngleInAnimation = () => {
    factory_1.Factory.registerAnimationType("growAngleIn", grow_polar_1.growAngleIn);
};

exports.registerGrowAngleInAnimation = registerGrowAngleInAnimation;

const registerGrowAngleOutAnimation = () => {
    factory_1.Factory.registerAnimationType("growAngleOut", grow_polar_1.growAngleOut);
};

exports.registerGrowAngleOutAnimation = registerGrowAngleOutAnimation;

const registerGrowRadiusInAnimation = () => {
    factory_1.Factory.registerAnimationType("growRadiusIn", grow_polar_1.growRadiusIn);
};

exports.registerGrowRadiusInAnimation = registerGrowRadiusInAnimation;

const registerGrowRadiusOutAnimation = () => {
    factory_1.Factory.registerAnimationType("growRadiusOut", grow_polar_1.growRadiusOut);
};

exports.registerGrowRadiusOutAnimation = registerGrowRadiusOutAnimation;

const registerMoveInAnimation = () => {
    factory_1.Factory.registerAnimationType("moveIn", move_1.moveIn);
};

exports.registerMoveInAnimation = registerMoveInAnimation;

const registerMoveOutAnimation = () => {
    factory_1.Factory.registerAnimationType("moveOut", move_1.moveOut);
};

exports.registerMoveOutAnimation = registerMoveOutAnimation;

const registerScaleInAnimation = () => {
    factory_1.Factory.registerAnimationType("scaleIn", scale_1.scaleIn);
};

exports.registerScaleInAnimation = registerScaleInAnimation;

const registerScaleOutAnimation = () => {
    factory_1.Factory.registerAnimationType("scaleOut", scale_1.scaleOut);
};

exports.registerScaleOutAnimation = registerScaleOutAnimation;

const registerRotateInAnimation = () => {
    factory_1.Factory.registerAnimationType("rotateIn", rotate_1.rotateIn);
};

exports.registerRotateInAnimation = registerRotateInAnimation;

const registerRotateOutAnimation = () => {
    factory_1.Factory.registerAnimationType("rotateOut", rotate_1.rotateOut);
};

exports.registerRotateOutAnimation = registerRotateOutAnimation;

const registerUpdateAnimation = () => {
    factory_1.Factory.registerAnimationType("update", update_1.update);
};

exports.registerUpdateAnimation = registerUpdateAnimation;
//# sourceMappingURL=index.js.map
