const path = require("node:path");

/**
 * `~` resolves the mobile app source; `@` resolves shared, framework-agnostic
 * modules from the main repo (types + pure sync/realtime/storage primitives) so
 * the app reuses that logic instead of duplicating it.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "~": "./src",
            "@": path.resolve(__dirname, ".."),
          },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      ],
    ],
  };
};
