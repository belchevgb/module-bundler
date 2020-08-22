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

interface EntryPoint {
    path: string;
    name?: string;
}

export interface Config {
    entrypoints: EntryPoint[];
    generators: Generator[];
    preprocessors: Preprocessor[];
    pathResolvers: PathResolver[];

    optimizers: Optimizer[];
}

const DEFAULT_CONFIG_FILE_NAME = "bundler-config.ts";

let config: Config;

function initEmptyProps(cfg: Config) {
    if (!cfg.preprocessors?.length) cfg.preprocessors = [];
    if (!cfg.generators?.length) cfg.generators = [];
    if (!cfg.pathResolvers?.length) cfg.pathResolvers = [];
    if (!cfg.optimizers?.length) cfg.optimizers = [];
}

function addDefaultConfig(cfg: Config, path: Path) {
    cfg.preprocessors.push(new TypeScriptPreprocessor());

    cfg.generators.push(new NumberIdGenerator());

    cfg.pathResolvers.push(new DefaultScriptPathResolver());

    cfg.entrypoints = [
        { path: path.resolveRelativeToProjectRoot("./src/compiler/js/ast/runtime.ts") },
        ...cfg.entrypoints
    ]
}

export function getConfig(path: Path): Config {
    if (config) return config;

    const cfg = require( path.resolveRelativeToProjectRoot(DEFAULT_CONFIG_FILE_NAME)) as Config;
    initEmptyProps(cfg);
    addDefaultConfig(cfg, path);

    return cfg;
}
