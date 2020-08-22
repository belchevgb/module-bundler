import { FileSystem } from "./interfaces";
import { NodeJsFileSystem } from "../fs/node-fs";
import { Config } from "../../config";

let fs: FileSystem;

export function getFileSystem(cfg: Config): FileSystem {
    if (!fs) fs = new NodeJsFileSystem();
    return fs;
}