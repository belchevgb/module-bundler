import { System, ModuleTypes, Asset } from "../interfaces";

export abstract class PathResolver {
    abstract resolve(currentModulePath: string, unresolvedPath: string, moduleType: ModuleTypes, system: System): Promise<string>;
}

const pathResolvers: PathResolver[] = [];

export function registerPathResolver(pathResolver: PathResolver) {
    pathResolvers.push(pathResolver);
}

export async function resolveAssetPath(currentModulePath: string, dependentPath: string, moduleType: ModuleTypes, system: System) {
    for (const pr of pathResolvers) {
        const result = await pr.resolve(currentModulePath, dependentPath, moduleType, system);
        
        if (result === null) {
            continue;
        }

        return result;
    }
}