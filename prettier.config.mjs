/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
const config = {
  printWidth: 100,
  trailingComma: "all",
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/styles/globals.css",
  tailwindFunctions: ["cn", "cva", "clsx"],
};

export default config;
