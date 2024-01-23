import { clipIn, clipOut } from "./clip";

import { fadeIn, fadeOut } from "./fade";

import { growCenterIn, growCenterOut, growHeightIn, growHeightOut, growWidthIn, growWidthOut } from "./grow-cartesian";

import { growAngleIn, growAngleOut, growRadiusIn, growRadiusOut } from "./grow-polar";

import { growPointsIn, growPointsOut, growPointsXIn, growPointsXOut, growPointsYIn, growPointsYOut } from "./grow-points";

import { growIntervalIn, growIntervalOut } from "./grow-interval";

import { moveIn, moveOut } from "./move";

import { scaleIn, scaleOut } from "./scale";

import { update } from "./update";

import { rotateIn, rotateOut } from "./rotate";

import { Factory } from "../../../core/factory";

export { clipIn, clipOut, fadeIn, fadeOut, moveIn, moveOut, scaleIn, scaleOut, rotateIn, rotateOut, growCenterIn, growCenterOut, growWidthIn, growWidthOut, growHeightIn, growHeightOut, growAngleIn, growAngleOut, growRadiusIn, growRadiusOut, growPointsIn, growPointsOut, growPointsXIn, growPointsXOut, growPointsYIn, growPointsYOut, growIntervalIn, growIntervalOut, update };

export const registerClipInAnimation = () => {
    Factory.registerAnimationType("clipIn", clipIn);
};

export const registerClipOutAnimation = () => {
    Factory.registerAnimationType("clipOut", clipOut);
};

export const registerFadeInAnimation = () => {
    Factory.registerAnimationType("fadeIn", fadeIn);
};

export const registerFadeOutAnimation = () => {
    Factory.registerAnimationType("fadeOut", fadeOut);
};

export const registerGrowCenterInAnimation = () => {
    Factory.registerAnimationType("growCenterIn", growCenterIn);
};

export const registerGrowCenterOutAnimation = () => {
    Factory.registerAnimationType("growCenterOut", growCenterOut);
};

export const registerGrowHeightInAnimation = () => {
    Factory.registerAnimationType("growHeightIn", growHeightIn);
};

export const registerGrowHeightOutAnimation = () => {
    Factory.registerAnimationType("growHeightOut", growHeightOut);
};

export const registerGrowWidthInAnimation = () => {
    Factory.registerAnimationType("growWidthIn", growWidthIn);
};

export const registerGrowWidthOutAnimation = () => {
    Factory.registerAnimationType("growWidthOut", growWidthOut);
};

export const registerGrowIntervalInAnimation = () => {
    Factory.registerAnimationType("growIntervalIn", growIntervalIn);
};

export const registerGrowIntervalOutAnimation = () => {
    Factory.registerAnimationType("growIntervalOut", growIntervalOut);
};

export const registerGrowPointsInAnimation = () => {
    Factory.registerAnimationType("growPointsIn", growPointsIn);
};

export const registerGrowPointsOutAnimation = () => {
    Factory.registerAnimationType("growPointsOut", growPointsOut);
};

export const registerGrowPointsXInAnimation = () => {
    Factory.registerAnimationType("growPointsXIn", growPointsXIn);
};

export const registerGrowPointsXOutAnimation = () => {
    Factory.registerAnimationType("growPointsXOut", growPointsXOut);
};

export const registerGrowPointsYInAnimation = () => {
    Factory.registerAnimationType("growPointsYIn", growPointsYIn);
};

export const registerGrowPointsYOutAnimation = () => {
    Factory.registerAnimationType("growPointsYOut", growPointsYOut);
};

export const registerGrowAngleInAnimation = () => {
    Factory.registerAnimationType("growAngleIn", growAngleIn);
};

export const registerGrowAngleOutAnimation = () => {
    Factory.registerAnimationType("growAngleOut", growAngleOut);
};

export const registerGrowRadiusInAnimation = () => {
    Factory.registerAnimationType("growRadiusIn", growRadiusIn);
};

export const registerGrowRadiusOutAnimation = () => {
    Factory.registerAnimationType("growRadiusOut", growRadiusOut);
};

export const registerMoveInAnimation = () => {
    Factory.registerAnimationType("moveIn", moveIn);
};

export const registerMoveOutAnimation = () => {
    Factory.registerAnimationType("moveOut", moveOut);
};

export const registerScaleInAnimation = () => {
    Factory.registerAnimationType("scaleIn", scaleIn);
};

export const registerScaleOutAnimation = () => {
    Factory.registerAnimationType("scaleOut", scaleOut);
};

export const registerRotateInAnimation = () => {
    Factory.registerAnimationType("rotateIn", rotateIn);
};

export const registerRotateOutAnimation = () => {
    Factory.registerAnimationType("rotateOut", rotateOut);
};

export const registerUpdateAnimation = () => {
    Factory.registerAnimationType("update", update);
};
//# sourceMappingURL=index.js.map
