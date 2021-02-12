"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuleResolutionPaths = void 0;
const path = require("path");
const env_1 = require("../env");
const utils_1 = require("../utils/utils");
const package_1 = require("./package");
function getModuleResolutionPaths(props) {
    const module = props.module;
    const { absPath, ctx, pkg } = module;
    let compilerOptions;
    let tsconfigPath;
    if (pkg.type === package_1.PackageType.USER_PACKAGE) {
        // any custom overrides
        if (ctx.tsConfigAtPaths.length) {
            for (const item of ctx.tsConfigAtPaths) {
                if (utils_1.isPathRelative(item.absPath, absPath)) {
                    compilerOptions = item.compilerOptions;
                    tsconfigPath = item.tsconfigPath;
                    break;
                }
            }
        }
        if (!compilerOptions) {
            compilerOptions = ctx.compilerOptions;
            tsconfigPath = env_1.env.SCRIPT_FILE;
        }
    }
    if (compilerOptions && compilerOptions.baseUrl) {
        let baseURL = compilerOptions.baseUrl;
        if (baseURL) {
            if (!path.isAbsolute(baseURL))
                baseURL = path.resolve(path.dirname(tsconfigPath), baseURL);
        }
        return {
            baseURL: baseURL,
            paths: compilerOptions.paths,
            tsconfigPath,
        };
    }
}
exports.getModuleResolutionPaths = getModuleResolutionPaths;
