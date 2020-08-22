import { PathResolver } from "../path-resolver";
import { ModuleTypes, System } from "../../interfaces";

const extensionsToLookFor = [".js", ".ts"];

export class DefaultScriptPathResolver extends PathResolver {
    resolve(currentModulePath: string, unresolvedPath: string, moduleType: ModuleTypes, system: System): Promise<string> {
        const currentExt = system.path.getFileExtension(unresolvedPath);
        if (currentExt) {
            return Promise.resolve(system.path.resolve(unresolvedPath));
        }

        const { path, fs } = system;

        for (const ext of extensionsToLookFor) {
            let resolvedPath = "";

            if (system.path.isAbsolute(unresolvedPath)) {
                resolvedPath = unresolvedPath;
            }

            const nodeModulesPath = path.join(__dirname, "node_modules", unresolvedPath);
            if (fs.exists(nodeModulesPath)) {
                resolvedPath = path.join(nodeModulesPath, "index.js");
            } else {
                resolvedPath = path.resolve(path.getDirname(currentModulePath), unresolvedPath + ext);
            }

            if (system.fs.exists(resolvedPath)) {
                return Promise.resolve(resolvedPath);
            }
        }

        return Promise.reject("Script path cannot be resolved");
    }
}