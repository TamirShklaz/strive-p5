export declare type IBumpVersionType = 'alpha' | 'beta' | 'dev' | 'major' | 'minor' | 'next' | 'patch' | 'rc';
export interface IBumpVersion {
    type: IBumpVersionType;
    userJson?: {
        version: string;
    };
}
export declare function bumpVersion(stringJson: string, opts: IBumpVersion): string;
