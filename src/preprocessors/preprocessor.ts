import { Asset } from "../interfaces";

export declare type PreprocessorContext = {
    fileContent: string;
    extension: string;
}

export abstract class Preprocessor {
    constructor(protected continueChainIfSuccess = false) { }

    abstract preprocess(ctx: PreprocessorContext): Promise<PreprocessorContext>;
}

const preprocessors: Preprocessor[] = [];

export function registerPreprocessor(preprocessor: Preprocessor) {
    preprocessors.push(preprocessor);
}

export async function preprocessAsset(ctx: PreprocessorContext) {
    for (const pr of preprocessors) {
        ctx = await pr.preprocess(ctx);
    }

    return ctx;
}