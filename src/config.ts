import { join } from "path";
import { Preprocessor } from "./preprocessors/preprocessor";
import { Generator } from "./generators/generator";
import { TypeScriptPreprocessor } from "./preprocessors/builtin/typescript-preprocessor";
import { NumberIdGenerator } from "./generators/builtin/number-id-generator";
import { PathResolver } from "./path-resolvers/path-resolver";
import { DefaultScriptPathResolver } from "./path-resolvers/builtin/default-script-path-resolver";
import { FileSystem } from "./utils/fs/interfaces";
import { Path } from "./utils/path/interfaces";
import { Optimizer } from "./optimizers/optimizer";
import { AssetAnalyzer } from "./analyzer";
import { DefaultJsAnalyzer } from "./analyzer/builtin/js-analyzer";
import { AssetTransformer } from "./transformers/transformer";
import { DefaultJsAssetTransformer } from "./transformers/builtin/js/js-asset.transformer";

interface EntryPoint {
    path: string;
    name?: string;
}

export interface Config {
    entrypoints: EntryPoint[];
    outDir: string;
    indexFile: string;
    generators: Generator[];
    preprocessors: Preprocessor[];
    pathResolvers: PathResolver[];
    analyzers: AssetAnalyzer[];
    optimizers: Optimizer[];
    transformers: AssetTransformer[];
}

const DEFAULT_CONFIG_FILE_NAME = "bundler-config.ts";

let config: Config;

function initEmptyProps(cfg: Config) {
    if (!cfg.preprocessors?.length) cfg.preprocessors = [];
    if (!cfg.generators?.length) cfg.generators = [];
    if (!cfg.pathResolvers?.length) cfg.pathResolvers = [];
    if (!cfg.optimizers?.length) cfg.optimizers = [];
    if (!cfg.analyzers?.length) cfg.analyzers = [];
    if (!cfg.optimizers?.length) cfg.optimizers = [];
    if (!cfg.transformers?.length) cfg.transformers = [];

    if (!cfg.outDir) cfg.outDir = "dist";
    if (!cfg.indexFile) cfg.indexFile = "index.html";
}

function addDefaultConfig(cfg: Config, path: Path) {
    cfg.preprocessors.push(new TypeScriptPreprocessor());

    cfg.generators.push(new NumberIdGenerator());

    cfg.pathResolvers.push(new DefaultScriptPathResolver());

    cfg.analyzers.push(new DefaultJsAnalyzer());

    cfg.transformers.push(new DefaultJsAssetTransformer());

    cfg.outDir = path.resolveRelativeToProjectRoot(cfg.outDir);
    cfg.indexFile = path.resolveRelativeToProjectRoot(cfg.indexFile);
}

export function getConfig(path: Path): Config {
    if (config) return config;

    const cfg = require( path.resolveRelativeToProjectRoot(DEFAULT_CONFIG_FILE_NAME)) as Config;
    initEmptyProps(cfg);
    addDefaultConfig(cfg, path);

    return cfg;
}
