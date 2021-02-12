"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeSplittingPhase = exports.resolveSplitEntry = void 0;
const package_1 = require("../../moduleResolver/package");
const ImportReference_1 = require("../module/ImportReference");
const SplitEntries_1 = require("../module/SplitEntries");
/**
 * Function to check if a module is only required thr
 * @param possibleSplitEntry
 */
function resolveDynamicImport(possibleSplitEntry) {
    const { moduleTree } = possibleSplitEntry;
    if (moduleTree.dependants.length === 0)
        return false;
    let isDynamic = true;
    for (const dependant of moduleTree.dependants) {
        // if all dependants require this module dynamic
        // then we have a splitEntry
        if (dependant.type !== ImportReference_1.ImportType.DYNAMIC_IMPORT) {
            isDynamic = false;
            break;
        }
    }
    return isDynamic;
}
/**
 * The core of the code splitting
 *
 * Provide it with a target and it will spit out a valid ISplitEntry
 *
 * @param productionContext
 * @param target
 */
function resolveSplitEntry(productionContext, target) {
    const entryModuleId = target.id;
    const subModules = [target];
    const circularModules = {};
    const visited = {};
    const traversed = {
        [entryModuleId]: true,
    };
    target.isSplit = true;
    const splitEntry = {
        circularModules,
        subModules,
        /**
         * traceCircularDependency accepts a target of type Module
         * it needs a reference to the parentId so we can safely trace back
         *
         * @param target
         * @param parentId
         */
        traceCircularDependency: function (target, parentId) {
            let traced = false;
            const { id, moduleTree: { dependants }, } = target;
            // prevent infinite loop
            if (!!this.circularModules[parentId][id]) {
                return this.circularModules[parentId][id];
            }
            for (const { module: dependant } of dependants) {
                /**
                 * if we resolve to the parent or entryModuleId
                 * we're safe to assume we're contained within the split
                 * otherwise dive in to the dependant hierarchy
                 */
                traced =
                    dependant.id === entryModuleId ||
                        dependant.id === parentId ||
                        this.traceCircularDependency(dependant, parentId);
                this.circularModules[parentId][id] = traced;
                if (!traced)
                    break;
            }
            return traced;
        },
        /**
         * traceOrigin accepts a target of type Module
         * it will validate against the already processed modules
         * and returns true if it origins back to the possibleSplitEntry Module
         *
         * @param target
         */
        traceOrigin: function (target, parentId) {
            const { id, moduleTree: { dependants }, } = target;
            /**
             * This check is to validate possible circular dependencies
             * It's quite complex to keep track of all falsy code
             * so we create a stack trace for it to validate against
             */
            if (!!this.visited[id]) {
                if (!(parentId in this.circularModules)) {
                    this.circularModules[parentId] = {};
                }
                const result = this.traceCircularDependency(target, parentId);
                // @todo: log circular trace to console
                // this.circularModules contains a stack trace
                return result;
            }
            this.visited[id] = true;
            let traced = false;
            for (const { module } of dependants) {
                if (module.id === entryModuleId) {
                    traced = true;
                }
                else if (!!productionContext.splitEntries.ids[module.id]) {
                    // the module is a dynamic module and not the entry, so false!
                    // we flagAsCommonsEligible here!
                    // target.isCommonsEligible = true;
                    // if we return false, it will be excluded and added to the mainBundle
                    traced = false;
                    // if we return true, it will be included in every splitBundle
                    // traced = true;
                }
                else {
                    traced = this.traceOrigin(module, id);
                }
                if (!traced) {
                    // @todo: config to flag all shared commons?
                    // target.flagAsCommonsEligible();
                    break;
                }
            }
            return traced;
        },
        /**
         * traverseDependencies accepts a target of type Module
         * it will check the modules that reference this module to validate isolation
         * if it's an isolated module (no other references) it will be included
         * in the splitted bundle. Also the dependencies of this module will be checked
         * to see if we can integrate those too
         *
         * @param target
         */
        traverseDependencies: function (target, entry = false) {
            const { id, moduleTree: { importReferences: { references }, }, } = target;
            // we already traversed this module, so we can skip it
            // this happens in case of circular deps
            // we return true because we want this module to be excluded
            if (!entry && !!this.traversed[id])
                return true;
            this.traversed[id] = true;
            // check if target is a dynamic module. If so, we want to exclude it
            const isDynamic = !entry ? !!productionContext.splitEntries.ids[target.id] : false;
            if (!isDynamic) {
                for (const { target: reference } of references) {
                    if (this.traceOrigin(reference, id)) {
                        const exclude = this.traverseDependencies(reference, false);
                        reference.isSplit = true;
                        if (!exclude)
                            this.subModules.push(reference);
                    }
                }
            }
            return isDynamic;
        },
        traversed,
        visited,
    };
    splitEntry.traverseDependencies(target, true);
    return SplitEntries_1.createSplitEntry({
        module: target,
        productionContext,
        subModules: splitEntry.subModules,
    });
}
exports.resolveSplitEntry = resolveSplitEntry;
/**
 * CodeSplittingPhase
 * heavy lifting by validating all modules included in the context
 * @param productionContext
 */
function CodeSplittingPhase(productionContext) {
    // loop over all modules to extract the modules that can be splitted
    const splitEntries = [];
    for (const possibleSplitEntry of productionContext.modules) {
        if (!possibleSplitEntry.isEntry && possibleSplitEntry.pkg.type === package_1.PackageType.USER_PACKAGE) {
            // check if the current module is only imported through
            // dynamic imports
            const isDynamic = resolveDynamicImport(possibleSplitEntry);
            if (isDynamic) {
                // resolve the complete tree for this module and add it
                // to the split entries
                splitEntries.push(possibleSplitEntry);
                productionContext.splitEntries.ids[possibleSplitEntry.id] = true;
            }
        }
    }
    // we needed to traverse all modules first to improve splitEntry resolvement
    // so now we can parse all dynamicModules that we found.
    for (const splitEntry of splitEntries) {
        productionContext.splitEntries.register(resolveSplitEntry(productionContext, splitEntry));
    }
}
exports.CodeSplittingPhase = CodeSplittingPhase;
