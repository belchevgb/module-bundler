import { Generator, GeneratorCommand } from "../generator";

let id = 0;

export class NumberIdGenerator extends Generator {
    generate(command: GeneratorCommand): Promise<any> {
        if (command === GeneratorCommand.moduleId) {
            return Promise.resolve(id++);
        }

        return null;
    }
}