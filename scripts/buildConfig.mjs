/*global console,process*/

import { config as loadDotEnvConfig } from "dotenv";

/**
 *
 * @param {string|undefined} nodeEnv NODE_ENV value
 * @returns {import('esbuild').BuildOptions}
 */
export default function getBuildConfig(nodeEnv = "development") {
  const envConfig = loadDotEnvConfig();
  const define = {
    [`process.env.APP_BUILD_VERSION`]: JSON.stringify(
      process.env.npm_package_version
    ),
    [`process.env.NODE_ENV`]: JSON.stringify(nodeEnv),
  };

  if (envConfig.parsed) {
    for (const k in envConfig.parsed)
      define[`process.env.${k}`] = JSON.stringify(process.env[k]);
    console.log(`[env] loaded ${Object.keys(define).length} values`);
  } else
    console.warn(
      `[env] failed to load, ${envConfig.error?.message ?? "unknown error"}`
    );

  return {
    entryPoints: ["src/index.ts"],
    bundle: true,
    sourcemap: true,
    outfile: "docs/bundle.js",
    define,
    // minify: true,
    plugins: [],
    loader: {
      ".png": "file",
    },
  };
}
