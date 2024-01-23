import { project } from "../../utils/geo";

export const mercator = (data, options) => {
    const points = [];
    return data.forEach((item => {
        const [x, y] = project([ item.lng, item.lat ]);
        points.push(Object.assign(Object.assign({}, item), {
            coordinates: [ x, y ]
        }));
    })), points;
};
//# sourceMappingURL=mercator.js.map