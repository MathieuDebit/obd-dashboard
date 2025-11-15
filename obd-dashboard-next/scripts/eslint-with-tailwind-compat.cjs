#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { join } = require("node:path");

const args = process.argv.slice(2);
const hasFileArg = args.some((arg) => !arg.startsWith("-"));
if (!hasFileArg) {
  args.push(".");
}

const eslintBin = join(__dirname, "..", "node_modules", ".bin", "eslint");
const aliasPath = require.resolve("./tailwind-eslint-alias.cjs");
const env = {
  ...process.env,
  NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --require ${aliasPath}`.trim(),
};

const result = spawnSync(eslintBin, args, {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 0);
