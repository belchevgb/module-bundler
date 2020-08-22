import { join } from "path";
import { Mutator } from "./mutators/mutator";
import { Preprocessor } from "./preprocessors/preprocessor";
import { Generator } from "./generators/generator";
import { TypeScriptPreprocessor } from "./preprocessors/builtin/typescript-preprocessor";
import { NumberIdGenerator } from "./generators/builtin/number-id-generator";
import { PathResolver } from "./path-resolvers/path-resolver";
import { DefaultScriptPathResolver } from "./path-resolvers/builtin/default-script-path-resolver";

interface EntryPoint {
    path: string;
    name?: string;
}

export interface Config {
    entrypoints: EntryPoint[];
    mutators: Mutator[];
    generators: Generator[];
    preprocessors: Preprocessor[];
    pathResolvers: PathResolver[];
}

const DEFAULT_CONFIG_FILE_NAME = "bundler-config.ts";

let config: Config;

function initEmptyProps(cfg: Config) {
    if (!cfg.mutators?.length) cfg.mutators = [];
    if (!cfg.preprocessors?.length) cfg.preprocessors = [];
    if (!cfg.generators?.length) cfg.generators = [];
    if (!cfg.pathResolvers?.length) cfg.pathResolvers = [];
}

function addDefaultConfig(cfg: Config) {
    cfg.preprocessors.push(new TypeScriptPreprocessor());

    cfg.generators.push(new NumberIdGenerator());

    cfg.pathResolvers.push(new DefaultScriptPathResolver());
}

export function getConfig(): Config {
    if (config) return config;

    const cfg = require(join(__dirname, "../..", "./" + DEFAULT_CONFIG_FILE_NAME)) as Config;
    initEmptyProps(cfg);
    addDefaultConfig(cfg);

    return cfg;
}
