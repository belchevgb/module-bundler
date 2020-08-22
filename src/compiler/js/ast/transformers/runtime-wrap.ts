import { JsModule } from "../../module";
import ts = require("typescript");

const moduleWrapper = `__addModule('{{moduleId}}', function(__exportedMembers) {
    {{body}}
    return __exportedMembers;
})`;

export function wrapModule(module: JsModule) {
    return moduleWrapper
        .replace("{{moduleId}}", module.id.toString())
        .replace("{{body}}", ts.createPrinter().printFile(module.ast));
}