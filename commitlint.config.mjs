/** @type {import("@commitlint/types").UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [2, "always", 120],
    "footer-max-line-length": [2, "always", 120],
  },
};

export default config;
