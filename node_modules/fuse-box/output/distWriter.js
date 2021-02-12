"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distWriter = exports.stripHash = void 0;
const path = require("path");
const utils_1 = require("../utils/utils");
function stripHash(str) {
    return str.replace(/([-_.]+)?\$hash([-_.]+)?(\.\w+)$/, '$3').replace(/\$hash([-_.]+)?/, '');
}
exports.stripHash = stripHash;
function distWriter(props) {
    const root = props.root;
    const self = {
        outputDirectory: props.root,
        // create writer to get the information before the bundle is  written
        createWriter: (options) => {
            let userString = options.userString;
            let hash;
            if (!options.hash) {
                userString = stripHash(userString);
            }
            else {
                if (options.hash && !options.forceDisableHash)
                    hash = options.hash;
                if (options.forceDisableHash)
                    userString = stripHash(userString);
            }
            if (hash)
                userString = userString.replace(/\$hash/g, hash);
            if (userString.indexOf('$name') > -1)
                userString = userString.replace(/\$name/g, options.fileName);
            const absPath = utils_1.ensureAbsolutePath(userString, root);
            const relativePath = utils_1.ensureFuseBoxPath(path.relative(root, absPath));
            // fix non trailing slashes in configuration
            const sep = relativePath.charAt(0) !== '/' && options.publicPath && !options.publicPath.endsWith('/') ? '/' : '';
            const browserPath = options.publicPath ? options.publicPath + sep + relativePath : relativePath;
            return {
                absPath,
                browserPath,
                relativePath,
            };
        },
        // the actual write function
        write: async (target, contents) => {
            if (!path.isAbsolute(target))
                target = path.join(self.outputDirectory, target);
            utils_1.ensureDir(path.dirname(target));
            await utils_1.writeFile(target, contents);
            return target;
        },
    };
    return self;
}
exports.distWriter = distWriter;
