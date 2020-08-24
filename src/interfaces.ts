import { FileSystem } from "./utils/fs/interfaces";
import { Path } from "./utils/path/interfaces";

export enum ModuleTypes {
    script,
    style
}

export class Asset {
    public dependencies: Asset[] = []
    public importedInModulesIds: string[] = [];
    public dependentModuleIds: string[] = [];
    public readonly rootAssetIds: string[] = [];

    constructor(
        public readonly originalFilePath: string,
        public readonly originalExtension: string,
        public latestContent: any,
        public currentExtension: string,
        public id: string
    ) { }
}

export class Bundle {
    constructor(public readonly modules: string[] = []) { }

    toString() {
        return this.modules.join("\n");
    }
}

export interface System {
    fs: FileSystem;
    path: Path;
}