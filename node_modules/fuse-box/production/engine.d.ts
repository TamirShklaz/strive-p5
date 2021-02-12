import { IProductionContext } from './ProductionContext';
export declare function Engine(productionContext: IProductionContext): {
    start: (phases?: ((productionContext: IProductionContext) => void)[]) => Promise<void>;
};
