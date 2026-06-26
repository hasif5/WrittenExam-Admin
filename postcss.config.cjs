// PostCSS configuration: Mantine preset plus responsive breakpoint variables.
// File: postcss.config.cjs
// Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
// Created: 2026-06-26

module.exports = {
  plugins: {
    "postcss-preset-mantine": {},
    "postcss-simple-vars": {
      variables: {
        "mantine-breakpoint-xs": "36em",
        "mantine-breakpoint-sm": "48em",
        "mantine-breakpoint-md": "62em",
        "mantine-breakpoint-lg": "75em",
        "mantine-breakpoint-xl": "88em",
      },
    },
  },
};
