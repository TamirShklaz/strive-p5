"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginNodeNative = exports.pluginNodeNativeHandler = void 0;
const utils_1 = require("../../utils/utils");
function pluginNodeNativeHandler(module) {
    const target = module.absPath;
    const packageRoot = module.pkg.meta.packageRoot;
    const relativeTarget = utils_1.pathRelative(packageRoot, target);
    const locationPrefix = utils_1.pathJoin('./node-native', utils_1.fastHash(packageRoot));
    const fileLocation = utils_1.pathJoin(locationPrefix, relativeTarget);
    const fileDestination = utils_1.pathJoin(module.ctx.writer.outputDirectory, fileLocation);
    module.captured = true;
    module.ctx.log.info('node-native', 'Captured $file with pluginNodeNative', {
        file: target,
    });
    if (!utils_1.fileExists(fileDestination)) {
        module.ctx.taskManager.copyFile(target, fileDestination);
    }
    module.contents = `module.exports = require("./${fileLocation.replace(/\\/gi, '/')}");`;
    // Scan all package directories for .so and .dll libraries and copy them to the output
    utils_1.listDirectory(packageRoot)
        .filter(filepath => {
        return /\.dll|\.so$|\.so\./.test(utils_1.getFilename(filepath));
    })
        .forEach(filepath => {
        const filename = utils_1.pathRelative(packageRoot, filepath);
        const libDestination = utils_1.pathJoin(module.ctx.writer.outputDirectory, locationPrefix, filename);
        if (!utils_1.fileExists(libDestination)) {
            module.ctx.taskManager.copyFile(filepath, libDestination);
        }
    });
}
exports.pluginNodeNativeHandler = pluginNodeNativeHandler;
function pluginNodeNative() {
    return (ctx) => {
        ctx.ict.on('bundle_resolve_module', props => {
            if (!props.module.captured && props.module.extension === '.node') {
                pluginNodeNativeHandler(props.module);
            }
            return props;
        });
    };
}
exports.pluginNodeNative = pluginNodeNative;
