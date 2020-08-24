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
import { visitEachJsModule as visitEachJsModule, astToString, visitEachJsModuleAsync, createRuntimeBundle, wrapModule, beautifyCode } from "./compiler/js/ast/utils";
import { optimizeBundle, registerOptimizer } from "./optimizers/optimizer";
import { parseHtml, insertAppScript } from "./compiler/html";
import { createAsset } from "./compiler/modules";
import { analyzeAsset, registerAnalyzer } from "./analyzer";
import { ModuleCache } from "./cache/module-cache";
import { isCommonModule } from "./internal/module-graph/common-modules";

class SystemImpl implements System {
    readonly fs: FileSystem;
    readonly path: Path;
    private cfg: Config;
    private entryModules: JsModule[] = [];
    private assetCache = new ModuleCache();

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
        const getAssetModule = async (currentModule: Asset, path: string) => {
            const currentModulePath = currentModule?.originalFilePath || "";
            const filePath = await resolveAssetPath(currentModulePath, path, ModuleTypes.script, this);
            const cachedAsset = this.assetCache.get(filePath);
            if (cachedAsset) {
                return cachedAsset;
            }

            const ext = this.path.getFileExtension(filePath);
            const content = this.fs.readTextFile(filePath);

            const preprocessedAsset = await preprocessAsset({ fileContent: content, extension: ext });
            const assetModule = createAsset(filePath, ext, preprocessedAsset.fileContent, preprocessedAsset.extension, await generate(GeneratorCommand.moduleId));

            this.assetCache.add(assetModule);

            return assetModule;
        }

        const linkModules = async(asset: Asset, root: Asset) => {
            const assetMetadata = await analyzeAsset(asset);

            if (assetMetadata?.imports?.length) {
                for (const imp of assetMetadata.imports) {
                    const dep = await getAssetModule(asset, imp);

                    dep.rootAssetIds.push(root.id);
                    dep.importedInModulesIds.push(asset.id);
                    asset.dependentModuleIds.push(dep.id);
                    asset.dependencies.push(dep);

                    // TODO: optimize
                    asset.latestContent = asset.latestContent.replace(imp, dep.id);
                }
            }

            for (const dep of asset.dependencies) {
                linkModules(dep, root);
            }
        };

        for (const ep of this.cfg.entrypoints) {
            const epModule = await getAssetModule(null, ep.path);
            this.entryModules.push(epModule as JsModule);

            await linkModules(epModule, epModule);
        }
    }

    private async output() {
        let bundles: Bundle[] = [];
        const commonModules = new Set<string>();

        const createBundleTrees = async (asset: Asset, bundle: Bundle) => {
            const moduleContent = wrapModule(asset);

            if (isCommonModule(asset)) {
                commonModules.add(moduleContent);
            } else {
                bundle.modules.push(moduleContent);
            }

            for (const chAsset of asset.dependencies) {
                await createBundleTrees(chAsset, bundle);
            }
        };

        for (const em of this.entryModules) {
            const bundle = new Bundle();
            bundles.push(bundle);

            await createBundleTrees(em, bundle);
        }

        const commonBundle = new Bundle(Array.from(commonModules));
        const runtimeBundle = createRuntimeBundle(this);

        bundles = [runtimeBundle, commonBundle, ...bundles];

        const html = this.fs.readTextFile(this.cfg.indexFile);
        const htmlAst = parseHtml(html);

        for (let i = 0; i < bundles.length; i++) {
            const bundle = bundles[i];
            let content = bundle.toString();

            if (this.cfg.mode === "prod") {
                content = await optimizeBundle(content, this);
            } else {
                content = beautifyCode(content);
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