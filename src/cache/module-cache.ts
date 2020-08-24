import { Asset } from "../interfaces";

export class ModuleCache {
    private assetPathToModuleCache = new Map<string, Asset>();
    private assetIdToModuleCache = new Map<string, Asset>();

    get(idOrPath: string) {
        const module = this.assetIdToModuleCache.get(idOrPath) || this.assetPathToModuleCache.get(idOrPath);
        return module;
    }

    add(module: Asset) {
        this.assetIdToModuleCache.set(module.id, module);
        this.assetPathToModuleCache.set(module.originalFilePath, module);
    }
}