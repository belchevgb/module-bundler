import { JsModule, JsModuleLibs } from "../../module";
import ts = require("typescript");
import { EXPORTED_MEMBERS_PROP_NAME } from "../utils";

const moduleWrapper = `__addModule('{{moduleId}}', function(${EXPORTED_MEMBERS_PROP_NAME}) {
    {{body}}
    return ${EXPORTED_MEMBERS_PROP_NAME};
})`;

export function wrapModule(module: JsModule) {
    return moduleWrapper
        .replace("{{moduleId}}", module.id.toString())
        .replace("{{body}}", ts.createPrinter().printFile(module.ast));
}