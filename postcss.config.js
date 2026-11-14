const path = require("node:path");

module.exports = {
  plugins: {
    "@stylexswc/postcss-plugin": {
      include: [
        "app/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "islands/**/*.{ts,tsx}",
        "pages/**/*.{ts,tsx}",
        "styles/**/*.ts",
      ],
      rsOptions: {
        aliases: { "@/*": [path.join(__dirname, "*")] },
        unstable_moduleResolution: { type: "commonJS", rootDir: __dirname },
      },
      useCSSLayers: false,
    },
    autoprefixer: {},
  },
};
