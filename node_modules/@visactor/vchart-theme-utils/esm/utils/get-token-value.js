export const getTokenValue = (token, defaultValue, chartContainer) => {
    const value = token && getComputedStyle(null != chartContainer ? chartContainer : document.body).getPropertyValue(token) || defaultValue;
    return value && !isNaN(value[0]) ? `rgba(${value})` : value;
};
//# sourceMappingURL=get-token-value.js.map