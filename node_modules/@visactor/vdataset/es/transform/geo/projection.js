import { project } from "../../utils/geo";

const PROJECTION_GROUP = {
    webmercator: project
};

export const projection = (data, options) => {
    if (!data || 0 === data.length) return data;
    const {projection: projection, as: as} = options, prjFunc = PROJECTION_GROUP[projection];
    if (data[0].lng) {
        return data.map((item => Object.assign(Object.assign({}, item), {
            [as]: prjFunc([ item.lng, item.lat ])
        })));
    }
    return data.map((ele => {
        const {coordinates: coordinates} = ele.geometry || {};
        if (!Array.isArray(coordinates[0])) {
            const processData = prjFunc(coordinates);
            return Object.assign(Object.assign({}, ele), {
                [as]: processData
            });
        }
        const processData = coordinates.map((item => Array.isArray(item[0]) ? item.map((coord => prjFunc(coord))) : prjFunc(item)));
        return Object.assign(Object.assign({}, ele), {
            [as]: processData,
            geometry: Object.assign(Object.assign({}, ele.geometry), {
                [as]: processData
            })
        });
    }));
};
//# sourceMappingURL=projection.js.map