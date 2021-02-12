/// <reference types="node" />
import * as fs from 'fs';
export declare function path2Regex(path: string): RegExp;
export declare function matchAll(regex: RegExp, str: string, cb: (matches: any) => void): void;
export declare function getFileModificationTime(absPath: any): number;
export declare function makePublicPath(target: string): string;
export declare function removeFolder(userPath: any): void;
export declare function readJSONFile(target: string): any;
export declare function isPathRelative(from: string, to: string): boolean;
export declare function isDirectoryEmpty(directory: string): boolean;
export declare function getPublicPath(x: string): string;
export declare function beautifyBundleName(absPath: string, maxLength?: number): string;
export declare const listDirectory: (dir: any, filelist?: any[]) => any[];
export declare function offsetLines(obj: any, amount: number): any;
export declare function isRegExp(input: any): boolean;
export declare function createRequireConst(name: string, variable?: string): string;
export declare function createRequireConstWithObject(name: string, variable: string, obj?: string): string;
export declare function createStringConst(name: string, value: string): string;
export declare function createVarString(name: string, value: string): string;
export declare function ensurePublicExtension(url: string): string;
export declare function parseVersion(version: string): any[];
export declare function replaceExt(npath: string, ext: any): string;
export declare function extractFuseBoxPath(homeDir: string, targetPath: string): string;
export declare const fileExists: typeof fs.existsSync;
export declare function readFile(file: string): string;
export declare function readFileAsync(file: string): Promise<string>;
export declare function readFileAsBuffer(file: string): Buffer;
export declare function removeFile(file: string): void;
export declare function copyFile(file: string, target: string): Promise<any>;
export declare function isObject(obj: any): boolean;
export declare function pathJoin(...args: any[]): string;
export declare function pathRelative(from: string, to: string): string;
export declare function getExtension(file: string): string;
export declare function getFilename(file: string): string;
export declare function ensureDir(dir: string): string;
export declare function ensurePackageJson(dir: string): void;
export declare function fileStat(file: string): fs.Stats;
export declare function makeFuseBoxPath(homeDir: string, absPath: string): string;
export declare function measureTime(group?: string): {
    end: (precision?: any) => any;
};
export declare function cleanExistingSourceMappingURL(contents: string): string;
export declare function safeRegex(contents: string): RegExp;
export declare function findReplace(str: string, re: RegExp, fn: (args: any) => string): string;
export declare function path2RegexPattern(input: undefined | RegExp | string): RegExp;
export declare function ensureUserPath(userPath: string, root?: string): string;
export declare type Concat = {
    content: Buffer;
    sourceMap: string;
    add(fileName: null | string, content: Buffer | string, sourceMap?: string): void;
};
export declare type ConcatModule = {
    new (generateSourceMap: boolean, outputFileName: string, seperator: string): Concat;
};
export declare const Concat: ConcatModule;
export declare function createConcat(generateSourceMap: boolean, outputFileName: string, seperator: string): Concat;
export declare function ensureAbsolutePath(userPath: string, root: string): string;
export declare function ensureScriptRoot(userPath: string): string;
/**
 * Given a list of folders, exclude any that are contained in any others
 * e.g.:
 *   - "/one/two"
 *   - "/one/two/three"  ❌ _exclude: contained by "/one/two"_
 *   - "/four/five/six"
 *   - "/four/five/six"  ❌ _exclude: duplicate_
 * @param folders
 */
export declare function excludeRedundantFolders(folders: string[]): string[];
export declare function getPathRelativeToConfig(props: {
    dirName: string;
    ensureDirExist?: boolean;
    fileName?: string;
}): string;
export declare function isNodeModuleInstalled(name: any): any;
export declare function ensureFuseBoxPath(input: undefined | string): string;
export declare function joinFuseBoxPath(...any: any[]): string;
export declare function writeFile(name: string, contents: any): Promise<void>;
export declare function randomHash(): string;
export declare function fastHash(text: string): string;
