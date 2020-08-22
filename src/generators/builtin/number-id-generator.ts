import { Generator, GeneratorCommand } from "../generator";
import { Asset } from "../../interfaces";
import { JsModule } from "../../compiler/js/module";

let id = 0;

export class NumberIdGenerator extends Generator {
    generate(command: GeneratorCommand, asset: Asset): Promise<any> {
        if (command === GeneratorCommand.jsModuleId && asset instanceof JsModule) {
            return Promise.resolve(id++);
        }

        return null;
    }
}