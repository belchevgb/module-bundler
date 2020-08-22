import ts = require("typescript");

const printer = ts.createPrinter();

export function printNode(node: ts.Node) {
    console.log(printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile()));
}