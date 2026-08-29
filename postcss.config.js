const path = require("node:path");

module.exports = {
  plugins: {
    "@stylexswc/postcss-plugin": {
      include: ["app/**/*.{js,jsx,ts,tsx}", "lib/**/*.{js,jsx,ts,tsx}"],
      rsOptions: {
        aliases: { "@/*": [path.join(__dirname, "*")] },
        unstable_moduleResolution: { type: "commonJS", rootDir: __dirname },
      },
      useCSSLayers: false,
    },
    autoprefixer: {},
  },
};
