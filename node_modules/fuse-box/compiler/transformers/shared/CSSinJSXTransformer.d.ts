import { ITransformer } from '../../interfaces/ITransformer';
export interface CSSInJSXTransformerOptions {
    autoInject?: boolean;
    autoLabel?: boolean;
    cssPropOptimization?: boolean;
    emotionCoreAlias?: string;
    jsxFactory?: string;
    labelFormat?: string;
    module?: any;
    sourceMap?: boolean;
    test?: RegExp | string;
}
/**
 * @todo
 * 1. expand the minify (way to simple :P)
 *
 * 2. Components as selectors
 * 3. Minification
 * 4. Sourcemaps
 * 5. Minify configurable?
 *
 * 5. Dead Code Elimination // not needed??
 */
export declare function CSSInJSXTransformer(options?: CSSInJSXTransformerOptions): ITransformer;
