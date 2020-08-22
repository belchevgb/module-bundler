import ts = require("typescript");

export function walkRecursively(node: ts.Node, cb: (n: ts.Node) => void) {
    cb(node);

    ts.forEachChild(node, c => walkRecursively(c, cb));
}