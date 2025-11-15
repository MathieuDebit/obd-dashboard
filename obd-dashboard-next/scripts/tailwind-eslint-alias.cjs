const Module = require("module");

const originalResolveFilename = Module._resolveFilename;
const COMPAT_PACKAGE = "tailwindcss-compat";
const TARGET = "tailwindcss";

Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  if (request === TARGET || request.startsWith(`${TARGET}/`)) {
    const compatRequest = request.replace(TARGET, COMPAT_PACKAGE);
    try {
      return originalResolveFilename.call(this, compatRequest, parent, isMain, options);
    } catch (error) {
      if (process.env.DEBUG_TAILWIND_COMPAT === "1") {
        console.warn(`[tailwind-compat] Failed to resolve ${compatRequest}: ${error.message}`);
      }
    }
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
