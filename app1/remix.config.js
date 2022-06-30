import * as fsp from "fs/promises";

import { BundleStatsWebpackPlugin } from "bundle-stats-webpack-plugin";
import { DuplicatesPlugin } from "inspectpack/plugin/index.js";

let pkgJson = await fsp.readFile("./package.json", "utf8");
let pkg = JSON.parse(pkgJson);

/** @type {Partial<import('remix-webpack-cli/lib/config-types').RemixWebpackConfig>} */
let config = {
  webpack: (config, { buildFor, mode, webpack }) => {
    if (buildFor === "client") {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.container.ModuleFederationPlugin({
          name: "app1",
          shared: {
            react: {
              singleton: true,
              version: pkg.dependencies.react,
            },
            "react-dom": {
              singleton: true,
              version: pkg.dependencies["react-dom"],
            },
          },
          exposes: {
            "./components/counter": "./app/components/counter.tsx",
          },
        })
      );
    }

    if (buildFor === "client" && mode === "production") {
      config.plugins = config.plugins || [];
      config.plugins.push(new DuplicatesPlugin({ verbose: true }));
      config.plugins.push(
        new BundleStatsWebpackPlugin({ baseline: true, compare: true })
      );
    }
  },
};

export default config;
