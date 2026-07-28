/**
 * PostCSS configuration (ESM — the package is `type: module`).
 *
 * Tailwind CSS and Autoprefixer process the global stylesheet. The Tailwind
 * plugin is required: the existing design system (styles/globals.css and the
 * component classes) relies on it, so it stays enabled in this sprint.
 *
 * @type {import('postcss-load-config').Config}
 */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
