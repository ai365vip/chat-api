import { cloneDeep } from "@visactor/vutils";

import { DATAVIEW_TYPE } from "../../constants";

export const GeoTreeParser = (data, options = {}, dataView) => (dataView.type = DATAVIEW_TYPE.GEO, 
cloneDeep(data));
//# sourceMappingURL=geotree.js.map