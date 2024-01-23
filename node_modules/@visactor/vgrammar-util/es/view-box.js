export const parseViewBox = config => "width" in config ? {
    x0: 0,
    x1: config.width,
    y0: 0,
    y1: config.height,
    width: config.width,
    height: config.height
} : {
    x0: Math.min(config.x0, config.x1),
    x1: Math.max(config.x0, config.x1),
    y0: Math.min(config.y0, config.y1),
    y1: Math.max(config.y0, config.y1),
    width: Math.abs(config.x1 - config.x0),
    height: Math.abs(config.y1 - config.y0)
};
//# sourceMappingURL=view-box.js.map