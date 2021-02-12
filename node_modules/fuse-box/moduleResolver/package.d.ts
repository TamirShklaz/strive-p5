import { IPackageMeta } from '../resolver/resolver';
export interface IPackage {
    deps?: Array<number>;
    id?: string;
    isExternalPackage?: boolean;
    isUserPackage?: boolean;
    meta?: IPackageMeta;
    mtime?: number;
    publicName?: string;
    type?: PackageType;
    init: () => void;
}
export declare function Package(): IPackage;
export declare enum PackageType {
    USER_PACKAGE = 0,
    EXTERNAL_PACKAGE = 1
}
export declare function createPackageFromCache(data: Record<string, any>): IPackage;
export declare function createPackage(props: {
    meta?: IPackageMeta;
    type?: PackageType;
}): IPackage;
