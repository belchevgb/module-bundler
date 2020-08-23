import { JSDOM } from "jsdom";

export function insertAppScript(ast: JSDOM, path: string) {
    const body = ast.window.document.body;
    const script = ast.window.document.createElement("script");

    script.src = path;
    body.appendChild(script);
}

export function parseHtml(html: string) {
    const ast = new JSDOM(html);
    return ast;
}