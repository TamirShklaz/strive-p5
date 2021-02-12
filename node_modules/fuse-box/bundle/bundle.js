"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBundle = exports.BundleType = void 0;
const CleanCSS = require("clean-css");
const convertSourceMap = require("convert-source-map");
const offsetLinesModule = require("offset-sourcemap-lines");
const path = require("path");
const Terser = require("terser");
const bundleSource_1 = require("../bundleRuntime/bundleSource");
const distWriter_1 = require("../output/distWriter");
var BundleType;
(function (BundleType) {
    BundleType[BundleType["CSS_APP"] = 1] = "CSS_APP";
    BundleType[BundleType["CSS_SPLIT"] = 2] = "CSS_SPLIT";
    BundleType[BundleType["JS_APP"] = 3] = "JS_APP";
    BundleType[BundleType["JS_SERVER_ENTRY"] = 4] = "JS_SERVER_ENTRY";
    BundleType[BundleType["JS_SPLIT"] = 5] = "JS_SPLIT";
    BundleType[BundleType["JS_VENDOR"] = 6] = "JS_VENDOR";
})(BundleType = exports.BundleType || (exports.BundleType = {}));
function createBundle(props) {
    const { bundleConfig, ctx, priority, type, webIndexed = true } = props;
    const outputConfig = ctx.outputConfig;
    const isProduction = ctx.config.isProduction;
    const target = ctx.config.target;
    const bundleWriter = distWriter_1.distWriter({ hashEnabled: isProduction, root: outputConfig.distRoot });
    const isCSS = type === BundleType.CSS_APP || type === BundleType.CSS_SPLIT;
    const source = bundleSource_1.createBundleSource({
        isCSS: isCSS,
        isProduction: props.ctx.config.isProduction,
        target,
    });
    const shouldCleanCSS = !!ctx.config.cleanCSS;
    function optimizeCSS(self) {
        let userProps = {};
        if (typeof ctx.config.cleanCSS === 'object')
            userProps = ctx.config.cleanCSS;
        const response = new CleanCSS(Object.assign(Object.assign({}, userProps), { sourceMap: source.containsMaps, sourceMapInlineSources: true })).minify(self.data.content.toString(), self.data.sourceMap);
        self.data = { sourceMap: response.sourceMap, content: response.styles };
    }
    const self = {
        config: null,
        contents: null,
        data: null,
        isCSSType: isCSS,
        priority,
        source,
        type,
        webIndexed,
        createSourceMap: async (sourceMap) => {
            const sourceMapName = path.basename(self.config.relativePath) + '.map';
            if (isCSS) {
                // just in case remove the existing sourcemap references
                // some css preprocessors add it
                self.contents = self.contents.replace(/\/\*\#\s?sourceMappingURL.*?\*\//g, '');
                self.contents += `\n/*#  sourceMappingURL=${sourceMapName} */`;
            }
            else {
                self.contents += `\n//# sourceMappingURL=${sourceMapName}`;
            }
            const targetDir = path.dirname(self.config.absPath);
            const sourceMapFile = path.join(targetDir, sourceMapName);
            await bundleWriter.write(sourceMapFile, sourceMap);
        },
        generate: async (opts) => {
            opts = opts || {};
            if (!self.config)
                self.prepare();
            if (self.entries) {
                source.entries = self.entries;
                if (self.exported)
                    source.exported = true;
            }
            ctx.ict.sync('before_bundle_write', { bundle: self });
            self.data = source.generate({ isIsolated: bundleConfig.isolatedApi, runtimeCore: opts.runtimeCore });
            if (isCSS && shouldCleanCSS)
                optimizeCSS(self);
            self.contents = self.data.content.toString();
            let sourceMap;
            if (source.containsMaps && self.data.sourceMap) {
                sourceMap = self.data.sourceMap.toString();
            }
            if (ctx.config.isProduction && !self.isCSSType && opts.uglify) {
                const terserOpts = {
                    sourceMap: source.containsMaps
                        ? {
                            content: self.data.sourceMap,
                            includeSources: true,
                        }
                        : undefined,
                };
                ctx.log.info('minify', self.config.absPath);
                const result = await Terser.minify(self.contents, terserOpts);
                self.contents = result.code;
                if (source.containsMaps && result.map) {
                    sourceMap = result.map.toString();
                }
            }
            // writing source maps
            if (source.containsMaps)
                await self.createSourceMap(sourceMap);
            // write the bundle to fs
            return await self.write();
        },
        generateHMRUpdate: () => {
            const concat = source.generate({ isIsolated: false, runtimeCore: undefined });
            const rawSourceMap = concat.sourceMap;
            let stringContent = concat.content.toString();
            if (self.source.containsMaps) {
                if (rawSourceMap) {
                    let json = JSON.parse(rawSourceMap);
                    // since new Function wrapoer adds extra 2 lines we need to shift sourcemaps
                    json = offsetLinesModule(json, 2);
                    const sm = convertSourceMap.fromObject(json).toComment();
                    stringContent += '\n' + sm;
                }
            }
            return stringContent;
        },
        prepare: () => {
            self.config = bundleWriter.createWriter({
                fileName: props.fileName,
                hash: isProduction && self.source.generateHash(),
                publicPath: bundleConfig.publicPath,
                userString: bundleConfig.path,
            });
            return self.config;
        },
        write: async () => {
            await bundleWriter.write(self.config.absPath, self.contents);
            return {
                absPath: self.config.absPath,
                browserPath: self.config.browserPath,
                bundle: self,
                relativePath: self.config.relativePath,
            };
        },
    };
    return self;
}
exports.createBundle = createBundle;
