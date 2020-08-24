import { Asset } from "../interfaces";
import { hasValue } from "../utils/common";

export enum GeneratorCommand {
    moduleId
}

export abstract class Generator {
    abstract generate(command: GeneratorCommand): Promise<any>;
}

const generators: Generator[] = [];

export function registerGenerator(gen: Generator) {
    generators.push(gen);
}

export async function generate(command: GeneratorCommand) {
    for (const gen of generators) {
        const result = await gen.generate(command);
        if (hasValue(result)) {
            return result;
        }
    }
}