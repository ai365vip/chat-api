import { initBrowserEnv, initNodeEnv } from "@visactor/vrender-kits";

import { isBrowserEnv, isNodeEnv } from "@visactor/vrender-core";

export const initAutoEnv = () => {
    isBrowserEnv() ? initBrowserEnv() : isNodeEnv() && initNodeEnv();
};

export { initBrowserEnv, initNodeEnv };