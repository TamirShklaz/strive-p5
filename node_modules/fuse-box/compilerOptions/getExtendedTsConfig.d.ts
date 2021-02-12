import { IRawTypescriptConfig } from './interfaces';
/**
 * Recursively loads the tsconfigs extended, and returns the resulting settings
 * merged sequentially.
 *
 * Does not mutate the original rawTsConfig.
 *
 * @param rawTsConfig The tsConfig result to load extended tsconfigs from.
 * @param tsConfigDirectory The directory containing 'rawTsConfig'.
 */
export declare const getExtendedTsConfig: (rawTsConfig: IRawTypescriptConfig, tsConfigDirectory: string) => [IRawTypescriptConfig, string] | undefined;
