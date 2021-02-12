/// <reference types="node" />
/**
  outputParser is an indepenent enttity that accepts a user string
  e.g "./dist" or "./dist/app.js" or "./dist/app.$hash.js"

  it should return an object which will be used by Bundle objects in order to generate
  contents into the correct folders e.g.

  Bundle
    type : VENDOR
    writer


  output parser can be used to write resources too
*/
export interface IOuputParserProps {
    expectDirectory?: boolean;
    hashEnabled?: boolean;
    root: string;
}
export declare function stripHash(str: string): string;
export interface IDistWriterInitProps {
    fileName?: string;
    forceDisableHash?: boolean;
    hash?: string;
    publicPath?: string;
    userString?: string;
}
export interface IDistWriteResponse {
    absPath: string;
    relativePath: string;
}
export interface DistWriter {
    outputDirectory: string;
    createWriter: (options: IDistWriterInitProps) => IWriterConfig;
    write: (target: string, contents: Buffer | string) => Promise<string>;
}
export interface IWriterConfig {
    absPath: string;
    browserPath: string;
    relativePath: string;
}
export declare function distWriter(props: IOuputParserProps): DistWriter;
