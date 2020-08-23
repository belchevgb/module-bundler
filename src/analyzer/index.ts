import { Asset } from "../interfaces";
export interface AssetMetadata {
    imports: string[];
}

export abstract class AssetAnalyzer {
    abstract analyze(asset: Asset): Promise<AssetMetadata>;
} 

const analyzers: AssetAnalyzer[] = [];

export function registerAnalyzer(analyzer: AssetAnalyzer) {
    analyzers.push(analyzer);
}

export async function analyzeAsset(asset: Asset): Promise<AssetMetadata> {
    for (const an of analyzers) {
        const res = await an.analyze(asset);
        if (res) {
            return res;
        }
    }
}