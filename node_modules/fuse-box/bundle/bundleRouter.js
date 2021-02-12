"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBundleRouter = void 0;
const path = require("path");
const bundleRuntimeCore_1 = require("../bundleRuntime/bundleRuntimeCore");
const package_1 = require("../moduleResolver/package");
const utils_1 = require("../utils/utils");
const bundle_1 = require("./bundle");
function createBundleRouter(props) {
    const { ctx, entries } = props;
    const ict = ctx.ict;
    const outputConfig = ctx.outputConfig;
    const hasVendorConfig = !!outputConfig.vendor;
    const hasMappings = !!outputConfig.mapping;
    const mappings = hasMappings && outputConfig.mapping.map(m => (Object.assign(Object.assign({}, m), { regexp: RegExp(m.matching) })));
    const bundles = [];
    const splitFileNames = [];
    const codeSplittingMap = {
        b: {},
    };
    let mainBundle;
    let cssBundle;
    let vendorBundle;
    function generateSplitFileName(relativePath) {
        const paths = relativePath.split(path.sep).reverse();
        let fileName = utils_1.beautifyBundleName(paths.shift());
        while (splitFileNames.indexOf(fileName) !== -1) {
            fileName = utils_1.beautifyBundleName(paths.shift() + path.sep + fileName);
        }
        splitFileNames.push(fileName);
        return fileName;
    }
    function createCSSBundle(name) {
        cssBundle = bundle_1.createBundle({
            bundleConfig: outputConfig.styles,
            ctx: ctx,
            type: bundle_1.BundleType.CSS_APP,
        });
        bundles.push(cssBundle);
    }
    function createMainBundle() {
        mainBundle = bundle_1.createBundle({
            bundleConfig: outputConfig.app,
            ctx: ctx,
            priority: 1,
            type: bundle_1.BundleType.JS_APP,
        });
        bundles.push(mainBundle);
    }
    function createVendorBundle() {
        vendorBundle = bundle_1.createBundle({
            bundleConfig: outputConfig.vendor,
            ctx: ctx,
            priority: 2,
            type: bundle_1.BundleType.JS_VENDOR,
        });
        bundles.push(vendorBundle);
    }
    function createSubVendorBundle(module, mapping) {
        const bundle = bundles.find(b => b.path === mapping.target.path);
        if (bundle)
            bundle.source.modules.push(module);
        else {
            const bundle = bundle_1.createBundle({
                bundleConfig: mapping.target,
                ctx: ctx,
                priority: 1,
                type: bundle_1.BundleType.JS_VENDOR,
            });
            bundle.source.modules.push(module);
            bundles.push(Object.assign(Object.assign({}, bundle), { path: mapping.target.path }));
        }
    }
    let codeSplittingIncluded = false;
    function createRuntimeCore() {
        let typescriptHelpersPath;
        if (ctx.config.productionBuildTarget)
            typescriptHelpersPath = ctx.config.tsHelpersPath;
        return bundleRuntimeCore_1.bundleRuntimeCore({
            codeSplittingMap: codeSplittingIncluded ? codeSplittingMap : undefined,
            includeHMR: ctx.config.hmr.enabled,
            interopRequireDefault: ctx.compilerOptions.esModuleInterop,
            isIsolated: false,
            target: ctx.config.target,
            typescriptHelpersPath: typescriptHelpersPath,
        });
    }
    const self = {
        generateBundles: (modules) => {
            for (const module of modules) {
                // we skip this module
                if (module.isSplit || module.ignore) {
                    continue;
                }
                if (ctx.config.isProduction && ctx.config.supportsStylesheet() && module.css) {
                    // special treatement for production styles
                    if (module.css.json) {
                        // if it's a css module
                        if (!mainBundle)
                            createMainBundle();
                        mainBundle.source.modules.push(module);
                    }
                    if (!cssBundle)
                        createCSSBundle();
                    cssBundle.source.modules.push(module);
                }
                else if (module.pkg.type === package_1.PackageType.EXTERNAL_PACKAGE && hasVendorConfig) {
                    let isMappedBundle = false;
                    if (hasMappings) {
                        for (const mapping of mappings) {
                            if (mapping.regexp.test(module.pkg.publicName)) {
                                createSubVendorBundle(module, mapping);
                                isMappedBundle = true;
                                break;
                            }
                        }
                    }
                    if (!isMappedBundle) {
                        if (!vendorBundle)
                            createVendorBundle();
                        vendorBundle.source.modules.push(module);
                    }
                }
                else {
                    if (!mainBundle)
                        createMainBundle();
                    mainBundle.source.modules.push(module);
                }
            }
        },
        generateSplitBundles: (entries) => {
            for (const splitEntry of entries) {
                const { entry, modules } = splitEntry;
                const fileName = generateSplitFileName(entry.publicPath);
                // @todo: improve the codeSplitting config
                const splitBundle = bundle_1.createBundle({
                    bundleConfig: {
                        path: outputConfig.codeSplitting.path,
                        publicPath: outputConfig.codeSplitting.publicPath,
                    },
                    ctx,
                    fileName,
                    type: bundle_1.BundleType.JS_SPLIT,
                    webIndexed: false,
                });
                let currentCSSBundle;
                for (const module of modules) {
                    if (ctx.config.isProduction && module.css) {
                        if (module.css.json) {
                            // if it's a css module
                            splitBundle.source.modules.push(module);
                        }
                        if (!currentCSSBundle) {
                            const cssFileName = generateSplitFileName(entry.publicPath.replace(/\.(\w+)$/, '.css'));
                            currentCSSBundle = bundle_1.createBundle({
                                bundleConfig: {
                                    path: outputConfig.styles.codeSplitting.path,
                                    publicPath: outputConfig.styles.codeSplitting.publicPath,
                                },
                                ctx,
                                fileName: cssFileName,
                                type: bundle_1.BundleType.CSS_SPLIT,
                                webIndexed: false,
                            });
                            bundles.push(currentCSSBundle);
                        }
                        currentCSSBundle.source.modules.push(module);
                    }
                    else {
                        splitBundle.source.modules.push(module);
                    }
                }
                const bundleConfig = splitBundle.prepare();
                // update a json object with entry for the API
                codeSplittingMap.b[entry.id] = {
                    p: bundleConfig.browserPath,
                };
                if (currentCSSBundle) {
                    const cssSplitConfig = currentCSSBundle.prepare();
                    codeSplittingMap.b[entry.id].s = cssSplitConfig.browserPath;
                }
                codeSplittingIncluded = true;
                bundles.push(splitBundle);
            }
        },
        init: async (modules) => {
            for (const m of modules) {
                if (!m.isCached)
                    ict.sync('bundle_resolve_module', { module: m });
            }
            await ict.resolve();
        },
        writeBundles: async () => {
            const bundleAmount = bundles.length;
            let index = 0;
            let apiInserted = false;
            const writers = [];
            let lastWebIndexed;
            bundles.sort((a, b) => a.priority - b.priority);
            while (index < bundleAmount) {
                const bundle = bundles[index];
                let writerProps = { uglify: ctx.config.uglify };
                if (bundle.webIndexed && !bundle.isCSSType) {
                    lastWebIndexed = bundle;
                    if (!apiInserted && bundle.priority === 1) {
                        apiInserted = true;
                        bundle.containsAPI = true;
                        writerProps.runtimeCore = createRuntimeCore();
                    }
                }
                writers.push(() => bundle.generate(writerProps));
                index++;
            }
            if (lastWebIndexed) {
                lastWebIndexed.containsApplicationEntryCall = true;
                lastWebIndexed.entries = entries;
                lastWebIndexed.exported = outputConfig.exported;
            }
            return await Promise.all(writers.map(write => {
                return write();
            }));
        },
        writeManifest: async (bundles) => {
            const manifest = [];
            for (const bundle of bundles) {
                let type;
                switch (bundle.bundle.type) {
                    case bundle_1.BundleType.CSS_APP:
                    case bundle_1.BundleType.CSS_SPLIT:
                        type = 'css';
                        break;
                    case bundle_1.BundleType.JS_APP:
                    case bundle_1.BundleType.JS_SERVER_ENTRY:
                    case bundle_1.BundleType.JS_SPLIT:
                    case bundle_1.BundleType.JS_VENDOR:
                    default:
                        type = 'js';
                        break;
                }
                manifest.push({
                    absPath: bundle.absPath,
                    browserPath: bundle.browserPath,
                    relativePath: bundle.relativePath,
                    type,
                    webIndexed: bundle.bundle.webIndexed,
                });
            }
            try {
                const manifestFile = path.join(outputConfig.distRoot, `manifest-${ctx.config.target}.json`);
                await utils_1.writeFile(manifestFile, JSON.stringify(manifest, null, 2));
                return manifestFile;
            }
            catch (err) {
                return;
            }
        },
    };
    return self;
}
exports.createBundleRouter = createBundleRouter;
