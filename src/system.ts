import { FileSystem } from "./utils/fs/interfaces"
import { getFileSystem } from "./utils/fs";
import { Config, getConfig } from "./config";
import { Path } from "./utils/path/interfaces";
import { getPath } from "./utils/path";
import { JsModule } from "./compiler/modules/js-module";
import { parseModule, getImportedModulePaths, getModuleLib } from "./compiler/js/ast/parse";
import { System, ModuleTypes, Bundle, Asset } from "./interfaces";
import { preprocessAsset, registerPreprocessor } from "./preprocessors/preprocessor";
import { generate, GeneratorCommand, registerGenerator } from "./generators/generator";
import { resolveAssetPath, registerPathResolver } from "./path-resolvers/path-resolver";
import { visitEachJsModule as visitEachJsModule, astToString, visitEachJsModuleAsync, createRuntimeBundle } from "./compiler/js/ast/utils";
import { optimizeBundle, registerOptimizer } from "./optimizers/optimizer";
import { parseHtml, insertAppScript } from "./compiler/html";
import { createAsset } from "./compiler/modules";
import { analyzeAsset, registerAnalyzer } from "./analyzer";

class SystemImpl implements System {
    readonly fs: FileSystem;
    readonly path: Path;
    private cfg: Config;
    private entryModules: JsModule[] = [];

    constructor() {
        this.fs = getFileSystem();
        this.path = getPath();
        this.cfg = getConfig(this.path);
    }

    async start() {
        this.registerPlugins();
        await this.buildAssetGraph();
        await this.output();
    }

    private registerPlugins() {
        this.cfg.generators.forEach(g => registerGenerator(g));
        this.cfg.preprocessors.forEach(p => registerPreprocessor(p));
        this.cfg.pathResolvers.forEach(p => registerPathResolver(p));
        this.cfg.analyzers.forEach(p => registerAnalyzer(p));
        this.cfg.optimizers.forEach(p => registerOptimizer(p));
    }

    private async buildAssetGraph() {
        const createAssetModule = async (currentModule: Asset, path: string) => {
            const currentModulePath = currentModule?.originalFilePath || "";
            const filePath = await resolveAssetPath(currentModulePath, path, ModuleTypes.script, this);
            const ext = this.path.getFileExtension(filePath);
            const content = this.fs.readTextFile(filePath);

            const preprocessedAsset = await preprocessAsset({ fileContent: content, extension: ext });
            const assetModule = createAsset(filePath, ext, preprocessedAsset.fileContent, preprocessedAsset.extension, await generate(GeneratorCommand.moduleId));

            return assetModule;
        }

        const linkModules = async(asset: Asset) => {
            const assetMetadata = await analyzeAsset(asset);

            if (assetMetadata?.imports?.length) {
                for (const imp of assetMetadata.imports) {
                    const dep = await createAssetModule(asset, imp);
                    asset.dependencies.push(dep);
                }
            }

            for (const dep of asset.dependencies) {
                linkModules(dep);
            }
        };

        for (const ep of this.cfg.entrypoints) {
            const epModule = await createAssetModule(null, ep.path);
            this.entryModules.push(epModule as JsModule);

            await linkModules(epModule);
        }
    }

    private async output() {
        const bundles: Bundle[] = [];

        const createBundleTrees = async (asset: Asset, bundle: Bundle) => {
            bundle.modules.push(asset.latestContent);

            for (const chAsset of asset.dependencies) {
                await createBundleTrees(chAsset, bundle);
            }
        };

        for (const em of this.entryModules) {
            const bundle = new Bundle();
            bundles.push(bundle);

            await createBundleTrees(em, bundle);
        }

        bundles.unshift(createRuntimeBundle(this));

        const html = this.fs.readTextFile(this.cfg.indexFile);
        const htmlAst = parseHtml(html);

        for (let i = 0; i < bundles.length; i++) {
            const bundle = bundles[i];
            let content = bundle.toString();

            if (this.cfg.mode === "prod") {
                content = await optimizeBundle(content, this);
            }

            const bundleName = `bundle_${i}.js`;
            const bundlePath = this.path.join(this.cfg.outDir, bundleName);

            insertAppScript(htmlAst, `./${bundleName}`);

            if (this.fs.exists(bundlePath)) {
                this.fs.delete(bundlePath);
            }

            this.fs.write(bundlePath, content);
        }

        const outputIndexPath = this.path.join(this.cfg.outDir, this.path.getFileName(this.cfg.indexFile));
        if (this.fs.exists(outputIndexPath)) {
            this.fs.delete(outputIndexPath);
        }

        this.fs.write(outputIndexPath, htmlAst.serialize());
    }
}

export const system = new SystemImpl();