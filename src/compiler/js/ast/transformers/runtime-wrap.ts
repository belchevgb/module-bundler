import { JsModule } from "../../module";

const moduleWrapper = `__addModule('{{moduleId}}', function(__exportedMembers) {
    {{body}}
    return __exportedMembers;
})`;

export function wrapModule(module: JsModule) {
    return moduleWrapper
        .replace("{{moduleId}}", module.id.toString())
        .replace("{{body}}", module.ast.getText());
}