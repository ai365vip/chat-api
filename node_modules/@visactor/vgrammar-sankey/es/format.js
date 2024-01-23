import { isNil } from "@visactor/vutils";

export const formatNodeRect = nodes => nodes.map((node => Object.assign({}, node, {
    x: node.x0,
    y: node.y0,
    width: node.x1 - node.x0,
    height: node.y1 - node.y0
})));

export const formatLinkPolygon = links => {
    var _a;
    return !isNil(null === (_a = null == links ? void 0 : links[0]) || void 0 === _a ? void 0 : _a.vertical) ? links.map((link => {
        const half = link.thickness / 2, points = [ {
            x: link.x0 - half,
            y: link.y0
        }, {
            x: link.x1 - half,
            y: link.y1
        }, {
            x: link.x1 + half,
            y: link.y1
        }, {
            x: link.x0 + half,
            y: link.y0
        } ];
        return Object.assign({}, link, {
            points: points
        });
    })) : links.map((link => {
        const half = link.thickness / 2, points = [ {
            x: link.x0,
            y: link.y0 - half
        }, {
            x: link.x1,
            y: link.y1 - half
        }, {
            x: link.x1,
            y: link.y1 + half
        }, {
            x: link.x0,
            y: link.y0 + half
        } ];
        return Object.assign({}, link, {
            points: points
        });
    }));
};

export const formatLinkPath = (links, round = !0) => {
    var _a;
    return !isNil(null === (_a = null == links ? void 0 : links[0]) || void 0 === _a ? void 0 : _a.vertical) ? links.map((link => {
        const half = link.thickness / 2;
        let y0 = link.y0, y1 = link.y1, midY = (y0 + y1) / 2, x00 = link.x0 - half, x01 = link.x0 + half, x10 = link.x1 - half, x11 = link.x1 + half;
        return round && (y0 = Math.round(y0), y1 = Math.round(y1), midY = Math.round(midY), 
        x00 = Math.round(x00), x01 = Math.round(x01), x10 = Math.round(x10), x11 = Math.round(x11)), 
        Object.assign({}, link, {
            path: `\n            M${x00},${y0}\n            C${x00},${midY},${x10},${midY},${x10},${y1}\n            L${x11},${y1}\n            C${x11},${midY},${x01},${midY},${x01},${y0}\n            Z\n            `
        });
    })) : links.map((link => {
        const half = link.thickness / 2;
        let x0 = link.x0, x1 = link.x1, midX = (x0 + x1) / 2, y00 = link.y0 - half, y01 = link.y0 + half, y10 = link.y1 - half, y11 = link.y1 + half;
        return round && (x0 = Math.round(x0), x1 = Math.round(x1), midX = Math.round(midX), 
        y00 = Math.round(y00), y01 = Math.round(y01), y10 = Math.round(y10), y11 = Math.round(y11)), 
        Object.assign({}, link, {
            path: `\n          M${x0},${y00}\n          C${midX},${y00},${midX},${y10},${x1},${y10}\n          L${x1},${y11}\n          C${midX},${y11},${midX},${y01},${x0},${y01}\n          Z`
        });
    }));
};

export const getBoundsOfNodes = nodes => {
    let x0 = 1 / 0, x1 = -1 / 0, y0 = 1 / 0, y1 = -1 / 0;
    return nodes.forEach((node => {
        x0 = Math.min(node.x0, x0), x1 = Math.max(node.x1, x1), y0 = Math.min(node.y0, y0), 
        y1 = Math.max(node.y1, y1);
    })), {
        x0: x0,
        x1: x1,
        y0: y0,
        y1: y1,
        width: x1 - x0,
        height: y1 - y0
    };
};

const isNodeVertical = node => node.sourceLinks && node.sourceLinks.length ? !isNil(node.sourceLinks[0].x0) : !(!node.targetLinks || !node.targetLinks.length) && !isNil(node.targetLinks[0].x0);

export const getAlignStartTexts = (nodes, offset = 0) => isNodeVertical(nodes[0]) ? nodes.map((node => ({
    y: node.y1,
    x: (node.x0 + node.x1) / 2,
    datum: node.datum,
    key: node.key
}))) : nodes.map((node => ({
    x: node.x1,
    y: (node.y0 + node.y1) / 2,
    datum: node.datum,
    key: node.key
})));

export const getAlignEndTexts = (nodes, offset = 0) => isNodeVertical(nodes[0]) ? nodes.map((node => ({
    y: node.y1 - offset,
    x: (node.x0 + node.x1) / 2,
    datum: node.datum,
    key: node.key
}))) : nodes.map((node => ({
    x: node.x0 - offset,
    y: (node.y0 + node.y1) / 2,
    datum: node.datum,
    key: node.key
})));