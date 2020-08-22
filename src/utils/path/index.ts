import { Path } from "./interfaces";
import { NodeJsPath } from "./node-path";
import { Config } from "../../config";

let path: Path;

export function getPath(): Path {
    if (!path) path = new NodeJsPath();
    return path;
}