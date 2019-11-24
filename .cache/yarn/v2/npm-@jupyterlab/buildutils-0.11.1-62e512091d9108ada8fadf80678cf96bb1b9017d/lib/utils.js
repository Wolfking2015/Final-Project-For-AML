"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const glob = require("glob");
const fs = require("fs-extra");
const childProcess = require("child_process");
const sortPackageJson = require("sort-package-json");
const coreutils = require("@phosphor/coreutils");
/**
 * Get all of the lerna package paths.
 */
function getLernaPaths(basePath = '.') {
    basePath = path.resolve(basePath);
    let baseConfig = require(path.join(basePath, 'package.json'));
    let paths = [];
    for (let config of baseConfig.workspaces) {
        paths = paths.concat(glob.sync(path.join(basePath, config)));
    }
    return paths.filter(pkgPath => {
        return fs.existsSync(path.join(pkgPath, 'package.json'));
    });
}
exports.getLernaPaths = getLernaPaths;
/**
 * Get all of the core package paths.
 */
function getCorePaths() {
    let spec = path.resolve(path.join('.', 'packages', '*'));
    return glob.sync(spec);
}
exports.getCorePaths = getCorePaths;
/**
 * Write a package.json if necessary.
 *
 * @param data - The package data.
 *
 * @oaram pkgJsonPath - The path to the package.json file.
 *
 * @returns Whether the file has changed.
 */
function writePackageData(pkgJsonPath, data) {
    let text = JSON.stringify(sortPackageJson(data), null, 2) + '\n';
    let orig = fs
        .readFileSync(pkgJsonPath, 'utf8')
        .split('\r\n')
        .join('\n');
    if (text !== orig) {
        fs.writeFileSync(pkgJsonPath, text, 'utf8');
        return true;
    }
    return false;
}
exports.writePackageData = writePackageData;
/**
 * Read a json file.
 */
function readJSONFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
exports.readJSONFile = readJSONFile;
/**
 * Write a json file.
 */
function writeJSONFile(filePath, data) {
    function sortObjByKey(value) {
        // https://stackoverflow.com/a/35810961
        return typeof value === 'object'
            ? Array.isArray(value)
                ? value.map(sortObjByKey)
                : Object.keys(value)
                    .sort()
                    .reduce((o, key) => {
                    const v = value[key];
                    o[key] = sortObjByKey(v);
                    return o;
                }, {})
            : value;
    }
    let text = JSON.stringify(data, sortObjByKey(data), 2) + '\n';
    let orig = {};
    try {
        orig = readJSONFile(filePath);
    }
    catch (e) {
        // no-op
    }
    if (!coreutils.JSONExt.deepEqual(data, orig)) {
        fs.writeFileSync(filePath, text, 'utf8');
        return true;
    }
    return false;
}
exports.writeJSONFile = writeJSONFile;
/**
 * Run a command with terminal output.
 *
 * @param cmd - The command to run.
 */
function run(cmd, options = {}, quiet) {
    options = options || {};
    options['stdio'] = options.stdio || 'inherit';
    if (!quiet) {
        console.log('>', cmd);
    }
    const value = childProcess.execSync(cmd, options);
    if (value === null) {
        return '';
    }
    return value
        .toString()
        .replace(/(\r\n|\n)$/, '')
        .trim();
}
exports.run = run;
