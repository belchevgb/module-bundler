import { FileSystem } from "./utils/fs/interfaces";
import { Path } from "./utils/path/interfaces";

export enum ModuleTypes {
    script,
    style
}

export class Asset {
    constructor(
        public filePath: string,
        public extension: string,
        public content: any,
        public size: number,
        public dependencies: Asset[] = []
    ) { }
}

export interface System {
    fs: FileSystem;
    path: Path;
}