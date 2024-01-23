import { Factory } from "../../core/factory";

export const treemapPresetAnimation = preset => "fadeIn" === preset ? {
    type: "fadeIn"
} : {
    type: "growCenterIn"
};

export const registerTreemapAnimation = () => {
    Factory.registerAnimation("treemap", ((params, preset) => ({
        appear: treemapPresetAnimation(preset),
        enter: {
            type: "growCenterIn"
        },
        exit: {
            type: "growCenterOut"
        },
        disappear: {
            type: "growCenterOut"
        }
    })));
};
//# sourceMappingURL=animation.js.map
