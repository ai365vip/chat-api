function getContextFont({fontStyle: fontStyle, fontVariant: fontVariant, fontWeight: fontWeight, fontSize: fontSize, fontFamily: fontFamily}) {
    return (fontStyle ? fontStyle + " " : "") + (fontVariant ? fontVariant + " " : "") + (fontWeight ? fontWeight + " " : "") + (fontSize || 12) + "px " + (fontFamily || "sans-serif");
}

export class GraphicUtil {
    constructor(canvas) {
        this.canvas = canvas, canvas && (this.ctx = canvas.getContext("2d"));
    }
    setCanvas(canvas) {
        this.canvas = canvas, canvas && (this.ctx = canvas.getContext("2d"));
    }
    measureText(tc) {
        return this.canvas ? this.measureTextByCanvas(tc) : (console.warn("[warn] no canvas, measureText might be not accurate"), 
        this.estimate(tc));
    }
    measureTextByCanvas(tc) {
        return this.ctx ? (this.ctx.font = getContextFont(tc), {
            width: this.ctx.measureText(tc.text).width,
            height: tc.fontSize
        }) : (console.error("[error!!!]measureTextByCanvas can not be called without canvas"), 
        {
            width: -1,
            height: tc.fontSize
        });
    }
    estimate({text: text, fontSize: fontSize}) {
        let eCharLen = 0, cCharLen = 0;
        for (let i = 0; i < text.length; i++) text.charCodeAt(i) < 128 ? eCharLen++ : cCharLen++;
        return {
            width: ~~(.8 * eCharLen * fontSize + cCharLen * fontSize),
            height: fontSize
        };
    }
    static getDefaultUtils(canvas) {
        return GraphicUtil.instance || (GraphicUtil.instance = new GraphicUtil(canvas)), 
        GraphicUtil.instance;
    }
}
//# sourceMappingURL=graph-util.js.map
