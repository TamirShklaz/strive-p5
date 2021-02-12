"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathsLookup = void 0;
const fs = require("fs");
const env_1 = require("../env");
const bindWatcherReactions_1 = require("../watcher/bindWatcherReactions");
const fileLookup_1 = require("./fileLookup");
function pathRegex(input) {
    const str = input.replace(/\*/, '(.*)').replace(/[\-\[\]\/\{\}\+\?\\\^\$\|]/g, '\\$&');
    return new RegExp(`^${str}`);
}
/**
 * Compile a list of functions to easily test directories
 *
 * @param {string} homeDir
 * @param {{ [key: string]: Array<string> }} [paths]
 * @returns
 */
const localPathsData = {};
function getPathsData(props) {
    const location = props.configLocation;
    if (props.cachePaths && localPathsData[location])
        return localPathsData[location];
    const fns = [];
    for (const key in props.paths) {
        fns.push((target) => {
            const re = pathRegex(key);
            const matched = target.match(re);
            if (matched) {
                const variable = matched[1];
                const directories = props.paths[key];
                return directories.map(item => item.replace(/\*/, variable));
            }
        });
    }
    if (props.cachePaths)
        localPathsData[location] = fns;
    return fns;
}
/**
 * Listing homeDir directories to simplify matching and makae it easier for the matcher
 *
 * @param {IPathsLookupProps} props
 * @returns {(DirectoryListing | undefined)}
 */
function getIndexFiles(props) {
    if (!props.baseURL)
        return [];
    const location = props.baseURL;
    if (props.cachePaths && bindWatcherReactions_1.WatchablePathCache[location] && bindWatcherReactions_1.WatchablePathCache[location].indexFiles) {
        return bindWatcherReactions_1.WatchablePathCache[location].indexFiles;
    }
    let indexFiles = [];
    const listed = fs.readdirSync(location);
    for (const file of listed) {
        if (file[0] !== '.') {
            const [nameWithoutExtension] = file.split('.');
            indexFiles.push({
                name: file,
                nameWithoutExtension,
            });
        }
    }
    if (props.cachePaths) {
        if (!bindWatcherReactions_1.WatchablePathCache[location])
            bindWatcherReactions_1.WatchablePathCache[location] = {};
        bindWatcherReactions_1.WatchablePathCache[location].indexFiles = indexFiles;
    }
    return indexFiles;
}
function pathsLookup(props) {
    props.configLocation = props.configLocation ? props.configLocation : env_1.env.SCRIPT_FILE;
    // if baseDir is the same as homeDir we can assume aliasing directories
    // and files without the need in specifying "paths"
    // so we check if first
    const indexFiles = getIndexFiles(props);
    if (indexFiles) {
        for (const i in indexFiles) {
            const item = indexFiles[i];
            // check if starts with it only
            const regex = new RegExp(`^${item.nameWithoutExtension}($|\\.|\\/)`);
            if (regex.test(props.target)) {
                const result = fileLookup_1.fileLookup({ fileDir: props.baseURL, target: props.target });
                if (result && result.fileExists) {
                    return result;
                }
            }
        }
    }
    // Performing the actual typescript paths match
    // "items" should be cached, so we are getting simple functions that contain
    // regular expressions
    const items = getPathsData(props);
    for (const i in items) {
        const test = items[i];
        const directories = test(props.target);
        if (directories) {
            for (const j in directories) {
                const directory = directories[j];
                const result = fileLookup_1.fileLookup({ fileDir: props.baseURL, isDev: props.isDev, target: directory });
                if (result && result.fileExists) {
                    return result;
                }
            }
        }
    }
}
exports.pathsLookup = pathsLookup;
