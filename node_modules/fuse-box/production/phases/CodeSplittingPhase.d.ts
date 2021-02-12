import { IModule } from '../../moduleResolver/module';
import { IProductionContext } from '../ProductionContext';
import { ISplitEntry } from '../module/SplitEntries';
/**
 * The core of the code splitting
 *
 * Provide it with a target and it will spit out a valid ISplitEntry
 *
 * @param productionContext
 * @param target
 */
export declare function resolveSplitEntry(productionContext: IProductionContext, target: IModule): ISplitEntry;
/**
 * CodeSplittingPhase
 * heavy lifting by validating all modules included in the context
 * @param productionContext
 */
export declare function CodeSplittingPhase(productionContext: IProductionContext): void;
