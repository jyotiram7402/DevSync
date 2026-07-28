const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

/**
 * Metro must watch the repo root so shared modules imported via `@/*` (types +
 * pure sync/realtime/storage helpers) are bundled. React/React Native are
 * pinned to the app's own node_modules to avoid duplicate copies.
 */
const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [repoRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
