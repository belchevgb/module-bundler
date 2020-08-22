import { Asset } from "../interfaces";

export abstract class Preprocessor {
    constructor(protected continueChainIfSuccess = false) { }

    abstract preprocess(asset: Asset): Promise<{ asset: Asset, continueChain?: boolean }>;
}

const preprocessors: Preprocessor[] = [];

export function registerPreprocessor(preprocessor: Preprocessor) {
    preprocessors.push(preprocessor);
}

export async function preprocessAsset(asset: Asset) {
    for (const pr of preprocessors) {
        const result = await pr.preprocess(asset);
        
        if (!result?.asset) {
            continue;
        }

        if (!result.continueChain) {
            return;
        }
    }
}