"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mappingsToResolver = exports.createTsTargetResolver = exports.groupByPackage = exports.buildMappings = exports.createTsParseConfigHost = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const typescript_1 = require("typescript");
const fileLookup_1 = require("../resolver/fileLookup");
const utils_1 = require("../utils/utils");
function createTsParseConfigHost() {
    return {
        fileExists: typescript_1.sys.fileExists,
        readDirectory: typescript_1.sys.readDirectory,
        readFile: typescript_1.sys.readFile,
        useCaseSensitiveFileNames: true,
    };
}
exports.createTsParseConfigHost = createTsParseConfigHost;
const resolveVirtual = process.versions.pnp && require('pnpapi').resolveVirtual;
// recurse through the references to build a mapping of outputs to inputs
function buildMappings(references, tsConfigDir) {
    // build the mappings
    const tsHost = createTsParseConfigHost();
    const inputsByOutput = new Map();
    const rawReferences = references || [];
    for (const rawRef of rawReferences) {
        const { path: rawPath } = rawRef;
        if (!rawPath)
            continue;
        const absPath = utils_1.ensureAbsolutePath(rawPath, tsConfigDir);
        recurseTsReference(tsHost, absPath, inputsByOutput, [fs_1.realpathSync(absPath)]);
    }
    return inputsByOutput;
}
exports.buildMappings = buildMappings;
// group an out-to-in mapping by package (accounting for nested pacakges)
function groupByPackage(mappings) {
    // find all the relevant package roots (bases)
    // we need to know what node packages the typescript out/in files are in
    // so that when we get an output, even if it is a PnP virtual path, we find the right out/in pair
    const byPackage = new Map();
    for (const [output, input] of mappings) {
        for (const { base, rel: outputRel } of packageAncestorsOf(output)) {
            const map = byPackage.get(base) || new Map();
            if (map.size == 0) {
                byPackage.set(base, map);
            }
            const inputRel = path_1.relative(base, input);
            map.set(outputRel, inputRel);
        }
    }
    return byPackage;
}
exports.groupByPackage = groupByPackage;
// Create a resolver that can resolve project subpaths
// mapping from outputs (e.g. dist/file.js) to their inputs (e.g. src/file.ts)
function createTsTargetResolver(references, tsConfigDir) {
    const mappings = groupByPackage(buildMappings(references, tsConfigDir));
    if (mappings.size === 0)
        return undefined;
    return mappingsToResolver(mappings);
}
exports.createTsTargetResolver = createTsTargetResolver;
function mappingsToResolver(mappings) {
    // take a base and a relative target and return the input, if any, that generates it
    function tsMapToInput(pkgRoot, subPath) {
        const inByOutRel = mappings.get(pkgRoot);
        if (inByOutRel) {
            const input = inByOutRel.get(subPath);
            if (input) {
                return input;
            }
        }
        return subPath;
    }
    // create a SubPathResolver that checks the Out->In maps
    const tsResolver = (base, target, type, props) => {
        const basicResult = fileLookup_1.resolveIfExists(base, tsMapToInput(base, target), type, props);
        if (basicResult) {
            return basicResult;
        }
        // Handle PnP virtual paths
        if (resolveVirtual) {
            const realBase = resolveVirtual(base);
            if (realBase && realBase !== base) {
                // if we are dealing with virtual paths
                // we need to send the "real" base path to the ts mapper
                // but send the original virtual base path as our result
                var result = fileLookup_1.resolveIfExists(base, tsMapToInput(realBase, target), type, props);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    };
    // Construct a TargetResolver but inject our own TypeScript sub-path resolver
    return (lookupArgs) => {
        // same as fileLookup but with our own subpath resolver
        // also, search .js first, because that's what our resolver is looking for
        return fileLookup_1.fileLookup(Object.assign(Object.assign({}, lookupArgs), { javascriptFirst: true, subPathResolver: tsResolver }));
    };
}
exports.mappingsToResolver = mappingsToResolver;
function parentDir(normalizedPath) {
    const parent = path_1.dirname(normalizedPath);
    return parent !== normalizedPath ? parent : undefined;
}
// find all package.json files in the folder ancestry
function packageAncestorsOf(path) {
    const result = [];
    const start = path_1.normalize(path);
    let rel = path_1.basename(start);
    for (let dir = parentDir(start); dir !== undefined; rel = utils_1.pathJoin(path_1.basename(dir), rel), dir = parentDir(dir)) {
        const packageJsonPath = utils_1.pathJoin(dir, 'package.json');
        if (utils_1.fileExists(packageJsonPath)) {
            result.push({ base: dir, rel });
        }
    }
    return result;
}
// Follow a single TypeScript reference recursively through its references
// adding output->input mappings along the way
function recurseTsReference(tsHost, reference, map, anticycle) {
    if (!utils_1.fileExists(reference)) {
        throw new Error(`Unable to find tsconfig reference ${reference}`);
    }
    const realPath = fs_1.realpathSync(reference);
    const result = loadTsConfig(realPath, tsHost);
    if (!result)
        return;
    const { files, references } = result;
    for (const file of files) {
        const existing = map.get(file.output);
        // Ensure either there is no entry for that output, or if there is, it is the same input producing it
        if (existing && existing !== file.input) {
            throw new Error(`Multiple input files map to same output file (1. "${existing}", 2. "${file.input}") => ("${file.output}")`);
        }
        map.set(file.output, file.input);
    }
    for (const subref of references || []) {
        const path = fs_1.realpathSync(subref.path);
        if (anticycle.includes(path)) {
            throw new Error(`Project references may not form a circular path. Cycle detected: ${subref.path}`);
        }
        recurseTsReference(tsHost, subref.path, map, [...anticycle, path]);
    }
}
// Read a tsconfig file from disk and parse out the relevant parts
// and scan input files
function loadTsConfig(path, host) {
    const normalized = path_1.normalize(path);
    const byFolder = utils_1.pathJoin(path, 'tsconfig.json');
    if (host.fileExists(byFolder))
        return loadTsConfig(byFolder, host);
    const raw = host.readFile(normalized);
    if (!raw) {
        throw new Error(`Unable to read tsconfig file at ${normalized}`);
    }
    const tsconfig = typescript_1.parseJsonText(normalized, raw);
    // use typescript's own config file logic to get the list of input files
    const files = typescript_1.parseJsonSourceFileConfigFileContent(tsconfig, host, path_1.dirname(normalized));
    if (!files.options.composite) {
        throw new Error(`Referenced project '${path}' must have settings "composite": true.`);
    }
    // since composite === true, we can determine each output from our list of inputs
    // so now we know which outputs a build would create, and what they are, and what their inputs are
    return {
        files: files.fileNames.map(input => calculateInOutMap(files.options.rootDir, files.options.outDir, input)),
        path: normalized,
        references: files.projectReferences,
    };
}
// The extensions that Typescript will process to the output directory
const tsOutExts = {
    '.js': '.js',
    '.json': '.json',
    '.jsx': '.js',
    '.ts': '.js',
    '.tsx': '.jsx',
};
// e.g.: (.*)((\.jsx$)|(\.json$)|(\.js$)|(\.tsx$)|(\.ts$))
const tsOutPattern = new RegExp(`(.*)(${Object.keys(tsOutExts)
    .map(ext => `(\\${ext})`)
    .join('|')})`);
function parseTsExtension(file) {
    const match = tsOutPattern.exec(file);
    return match ? { ext: match[2], stem: match[1] } : { ext: '', stem: file };
}
// Calculate the output -> input map given the rootDir, outDir, and input
function calculateInOutMap(rootDir, outDir, input) {
    const nroot = path_1.normalize(rootDir);
    const nout = path_1.normalize(outDir);
    const ninput = path_1.normalize(input);
    if (!ninput.startsWith(nroot)) {
        throw new Error(`File '${ninput}' is not under 'rootDir' '${rootDir}'. 'rootDir' is expected to contain all source files`);
    }
    // strip the root part to get the relative part
    const relInput = ninput.substr(nroot.length);
    const { ext, stem } = parseTsExtension(relInput);
    const outExt = tsOutExts[ext] || ext;
    return (outExt && {
        base: rootDir,
        input: ninput,
        output: utils_1.pathJoin(nout, `${stem}${outExt}`),
    });
}
