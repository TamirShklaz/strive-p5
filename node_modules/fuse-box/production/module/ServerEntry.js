"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerEntry = void 0;
const bundle_1 = require("../../bundle/bundle");
async function createServerEntry(ctx, bundles) {
    const serverEntryFileName = ctx.outputConfig.serverEntry || 'serverEntry.js';
    const serverEntry = bundle_1.createBundle({
        bundleConfig: {
            path: serverEntryFileName,
        },
        ctx,
        fileName: serverEntryFileName,
        type: bundle_1.BundleType.JS_SERVER_ENTRY,
        webIndexed: false,
    });
    serverEntry.prepare();
    serverEntry.contents = '';
    const sorted = bundles.sort((a, b) => a.bundle.priority - b.bundle.priority);
    const bundlesLength = bundles.length;
    let index = 0;
    const indexedSet = [bundle_1.BundleType.JS_APP, bundle_1.BundleType.JS_VENDOR];
    while (index < bundlesLength) {
        const item = sorted[index];
        if (indexedSet.includes(item.bundle.type)) {
            serverEntry.contents += `require("./${sorted[index].relativePath}");\n`;
        }
        index++;
    }
    return await serverEntry.write();
}
exports.createServerEntry = createServerEntry;
