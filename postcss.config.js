const babelConfig = require("./babel.config");

module.exports = {
  plugins: {
    "@stylexjs/postcss-plugin": {
      include: ["app/**/*.{js,jsx,ts,tsx}", "lib/**/*.{js,jsx,ts,tsx}"],
      babelConfig: {
        babelrc: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: babelConfig.plugins,
      },
      // ponytail: globals.css (preflight, @font-face) is unlayered and would outrank
      // layered StyleX. Keep layers off while any unlayered CSS ships.
      useCSSLayers: false,
    },
    autoprefixer: {},
  },
};
