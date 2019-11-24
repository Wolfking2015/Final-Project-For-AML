/// <reference types="node" />
import childProcess = require('child_process');
/**
 * Get all of the lerna package paths.
 */
export declare function getLernaPaths(basePath?: string): string[];
/**
 * Get all of the core package paths.
 */
export declare function getCorePaths(): string[];
/**
 * Write a package.json if necessary.
 *
 * @param data - The package data.
 *
 * @oaram pkgJsonPath - The path to the package.json file.
 *
 * @returns Whether the file has changed.
 */
export declare function writePackageData(pkgJsonPath: string, data: any): boolean;
/**
 * Read a json file.
 */
export declare function readJSONFile(filePath: string): any;
/**
 * Write a json file.
 */
export declare function writeJSONFile(filePath: string, data: any): boolean;
/**
 * Run a command with terminal output.
 *
 * @param cmd - The command to run.
 */
export declare function run(cmd: string, options?: childProcess.ExecSyncOptions, quiet?: boolean): string;
