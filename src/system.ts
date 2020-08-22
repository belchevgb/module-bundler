import { FileSystem } from "./utils/fs/interfaces"
import { getFileSystem } from "./utils/fs";
import { Config, getConfig } from "./config";
import { Path } from "./utils/path/interfaces";
import { getPath } from "./utils/path";
import { JsModule } from "./compiler/js/module";
import { parseModule, getImportedModulePaths, getModuleLib } from "./compiler/js/ast/parse";
import { System, ModuleTypes } from "./interfaces";
import { Mutator } from "./mutators/mutator";
import { Preprocessor, preprocessAsset, registerPreprocessor } from "./preprocessors/preprocessor";
import { generate, GeneratorCommand, Generator, registerGenerator } from "./generators/generator";
import { transformJsModule } from "./compiler/js/ast/transformers";
import { resolveAssetPath, registerPathResolver } from "./path-resolvers/path-resolver";

class SystemImpl implements System {
    readonly fs: FileSystem;
    readonly path: Path;
    private cfg: Config;
    private entryModules: JsModule[] = [];

    constructor() {
        this.cfg = getConfig();
        this.fs = getFileSystem(this.cfg);
        this.path = getPath(this.cfg);
    }

    start() {
        this.registerPlugins();
        this.buildJsModuleGraph();
    }

    private registerPlugins() {
        this.cfg.generators.forEach(g => registerGenerator(g));
        this.cfg.preprocessors.forEach(p => registerPreprocessor(p));
        this.cfg.pathResolvers.forEach(p => registerPathResolver(p));
    }

    private buildJsModuleGraph() {
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


            importedModules.forEach(async p => {
                const dep = await createModule(module, p);
                module.dependencies.push(dep);
            });
        }

        this.cfg.entrypoints.forEach(async ep => {
            const epModule = await createModule(null, ep.path);
            this.entryModules.push(epModule);

            await walkModuleTree(epModule);
        });
    }
}

export const system = new SystemImpl();