import { FileSystem } from "./utils/fs/interfaces"
import { getFileSystem } from "./utils/fs";
import { Config, getConfig } from "./config";
import { Path } from "./utils/path/interfaces";
import { getPath } from "./utils/path";
import { JsModule } from "./compiler/js/module";
import { parseModule, getImportedModulePaths, getModuleLib } from "./compiler/js/ast/parse";
import { System, ModuleTypes, Bundle } from "./interfaces";
import { preprocessAsset, registerPreprocessor } from "./preprocessors/preprocessor";
import { generate, GeneratorCommand, registerGenerator } from "./generators/generator";
import { transformJsModule } from "./compiler/js/ast/transformers";
import { resolveAssetPath, registerPathResolver } from "./path-resolvers/path-resolver";
import { visitEachJsModule as visitEachJsModule, astToString } from "./compiler/js/ast/utils";
import { optimizeAsset } from "./optimizers/optimizer";

class SystemImpl implements System {
    readonly fs: FileSystem;
    readonly path: Path;
    private cfg: Config;
    private entryModules: JsModule[] = [];
    private bundles: Bundle[] = [];

    constructor() {
        this.fs = getFileSystem();
        this.path = getPath();
        this.cfg = getConfig(this.path);
    }

    async start() {
        this.registerPlugins();
        await this.buildJsModuleGraph();
        this.createBundles();
    }

    private registerPlugins() {
        this.cfg.generators.forEach(g => registerGenerator(g));
        this.cfg.preprocessors.forEach(p => registerPreprocessor(p));
        this.cfg.pathResolvers.forEach(p => registerPathResolver(p));
    }

    private async buildJsModuleGraph() {
        const createModule = async (currentModule: JsModule, path: string) => {
            const currentModulePath = currentModule?.filePath || "";
            const filePath = await resolveAssetPath(currentModulePath, path, ModuleTypes.script, this);
            const ext = this.path.getFileExtension(filePath);
            const content = this.fs.readTextFile(filePath);
            const module = new JsModule(filePath, ext, content, content.length);

            await preprocessAsset(module);

            module.fileName = this.path.getFileName(filePath);
            module.id = await generate(GeneratorCommand.jsModuleId, module);
            module.ast = parseModule(module);
            module.moduleLib = getModuleLib(module);

            transformJsModule(module);

            return module;
        }

        const walkModuleTree = async (module: JsModule) => {
            const importedModules = getImportedModulePaths(module);

            for (const p of importedModules) {
                const dep = await createModule(module, p);
                module.dependencies.push(dep);
            }
            
            module.dependencies.forEach(d => walkModuleTree(d as JsModule));
        }


        for (const ep of this.cfg.entrypoints) {
            const epModule = await createModule(null, ep.path);
            this.entryModules.push(epModule);

            visitEachJsModule(epModule, async m => {
                const importedModules = getImportedModulePaths(m);

                for (const p of importedModules) {
                    const dep = await createModule(m, p);
                    m.dependencies.push(dep);
                }
            });
        }
    }

    private createBundles() {
        this.entryModules.forEach(em => {
            const bundle = new Bundle();
            this.bundles.push(bundle);

            visitEachJsModule(em, async m => {
                await optimizeAsset(em, this);
                bundle.modules.push(astToString(m.ast));
            });
        });
    }
}

export const system = new SystemImpl();