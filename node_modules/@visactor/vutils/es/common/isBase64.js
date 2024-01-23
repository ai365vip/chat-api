const isBase64 = value => new RegExp(/^data:image\/(?:gif|png|jpeg|bmp|webp|svg\+xml)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/g).test(value);

export default isBase64;
//# sourceMappingURL=isBase64.js.map