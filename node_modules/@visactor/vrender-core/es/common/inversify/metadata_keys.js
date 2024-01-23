export const NAMED_TAG = "named";

export const NAME_TAG = "name";

export const UNMANAGED_TAG = "unmanaged";

export const OPTIONAL_TAG = "optional";

export const INJECT_TAG = "inject";

export const MULTI_INJECT_TAG = "multi_inject";

export const TAGGED = "inversify:tagged";

export const TAGGED_PROP = "inversify:tagged_props";

export const PARAM_TYPES = "inversify:paramtypes";

export const DESIGN_PARAM_TYPES = "design:paramtypes";

export const PRE_DESTROY = "pre_destroy";

function getNonCustomTagKeys() {
    return [ "inject", "multi_inject", "name", "unmanaged", "named", "optional" ];
}

export const NON_CUSTOM_TAG_KEYS = getNonCustomTagKeys();
//# sourceMappingURL=metadata_keys.js.map
