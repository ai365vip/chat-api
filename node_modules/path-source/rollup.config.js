export default {
  input: "index",
  external: [
    "array-source"
  ],
  output: {
    extend: true,
    file: "dist/path-source.js",
    format: "umd",
    globals: {
      "array-source": "sources.array"
    },
    name: "sources.path"
  }
};
