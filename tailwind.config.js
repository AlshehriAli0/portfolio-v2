/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            code: {
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              fontWeight: "500",
            },
            pre: {
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              fontWeight: "500",
            },
            "pre code": {
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              fontWeight: "500",
            },
            "inline-code": {
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              fontWeight: "500",
            },
          },
        },
        lg: {
          css: {
            h2: {
              fontSize: "1.3rem",
              marginBottom: "1rem",
            },
            code: {
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              fontWeight: "500",
            },
            pre: {
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              fontWeight: "500",
            },
            "pre code": {
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              fontWeight: "500",
            },
          },
        },
      },
      fontFamily: {
        mono: "var(--font-monospace)",
      },
      boxShadow: {
        project: `
          0 2px 12px rgba(0, 0, 0, 0.02),
          0 4px 8px rgba(0, 0, 0, 0.03),
          0 2px 4px rgba(0, 0, 0, 0.04),
          0 1px 2px rgba(0, 0, 0, 0.05),
          0 1px rgba(0, 0, 0, 0.06),
          0 0 0 8px rgba(0, 0, 0, 0.02),
          0 24px 48px rgba(0, 0, 0, 0.08)
        `,
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
