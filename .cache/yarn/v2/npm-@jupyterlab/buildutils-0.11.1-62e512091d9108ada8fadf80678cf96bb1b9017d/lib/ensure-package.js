"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const glob = __importStar(require("glob"));
const path = __importStar(require("path"));
const ts = __importStar(require("typescript"));
const get_dependency_1 = require("./get-dependency");
const utils = __importStar(require("./utils"));
/**
 * Ensure the integrity of a package.
 *
 * @param options - The options used to ensure the package.
 *
 * @returns A list of changes that were made to ensure the package.
 */
function ensurePackage(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let { data, pkgPath } = options;
        let deps = data.dependencies || {};
        let devDeps = data.devDependencies || {};
        let seenDeps = options.depCache || {};
        let missing = options.missing || [];
        let unused = options.unused || [];
        let messages = [];
        let locals = options.locals || {};
        // Verify dependencies are consistent.
        let promises = Object.keys(deps).map((name) => __awaiter(this, void 0, void 0, function* () {
            if (!(name in seenDeps)) {
                seenDeps[name] = yield get_dependency_1.getDependency(name);
            }
            if (deps[name] !== seenDeps[name]) {
                messages.push(`Updated dependency: ${name}@${seenDeps[name]}`);
            }
            deps[name] = seenDeps[name];
        }));
        yield Promise.all(promises);
        // Verify devDependencies are consistent.
        promises = Object.keys(devDeps).map((name) => __awaiter(this, void 0, void 0, function* () {
            if (!(name in seenDeps)) {
                seenDeps[name] = yield get_dependency_1.getDependency(name);
            }
            if (devDeps[name] !== seenDeps[name]) {
                messages.push(`Updated devDependency: ${name}@${seenDeps[name]}`);
            }
            devDeps[name] = seenDeps[name];
        }));
        yield Promise.all(promises);
        // For TypeScript files, verify imports match dependencies.
        let filenames = [];
        filenames = glob.sync(path.join(pkgPath, 'src/*.ts*'));
        filenames = filenames.concat(glob.sync(path.join(pkgPath, 'src/**/*.ts*')));
        if (!fs.existsSync(path.join(pkgPath, 'tsconfig.json'))) {
            if (utils.writePackageData(path.join(pkgPath, 'package.json'), data)) {
                messages.push('Updated package.json');
            }
            return messages;
        }
        let imports = [];
        // Extract all of the imports from the TypeScript files.
        filenames.forEach(fileName => {
            let sourceFile = ts.createSourceFile(fileName, fs.readFileSync(fileName).toString(), ts.ScriptTarget.ES6, 
            /*setParentNodes */ true);
            imports = imports.concat(getImports(sourceFile));
        });
        let names = Array.from(new Set(imports)).sort();
        names = names.map(function (name) {
            let parts = name.split('/');
            if (name.indexOf('@') === 0) {
                return parts[0] + '/' + parts[1];
            }
            return parts[0];
        });
        // Look for imports with no dependencies.
        promises = names.map((name) => __awaiter(this, void 0, void 0, function* () {
            if (missing.indexOf(name) !== -1) {
                return;
            }
            if (name === '.' || name === '..') {
                return;
            }
            if (!deps[name]) {
                if (!(name in seenDeps)) {
                    seenDeps[name] = yield get_dependency_1.getDependency(name);
                }
                deps[name] = seenDeps[name];
                messages.push(`Added dependency: ${name}@${seenDeps[name]}`);
            }
        }));
        yield Promise.all(promises);
        // Look for unused packages
        Object.keys(deps).forEach(name => {
            if (options.noUnused === false) {
                return;
            }
            if (unused.indexOf(name) !== -1) {
                return;
            }
            const isTest = data.name.indexOf('test') !== -1;
            if (isTest) {
                const testLibs = ['jest', 'ts-jest', '@jupyterlab/testutils'];
                if (testLibs.indexOf(name) !== -1) {
                    return;
                }
            }
            if (names.indexOf(name) === -1) {
                let version = data.dependencies[name];
                messages.push(`Unused dependency: ${name}@${version}: remove or add to list of known unused dependencies for this package`);
            }
        });
        // Handle references.
        let references = Object.create(null);
        Object.keys(deps).forEach(name => {
            if (!(name in locals)) {
                return;
            }
            const target = locals[name];
            if (!fs.existsSync(path.join(target, 'tsconfig.json'))) {
                return;
            }
            let ref = path.relative(pkgPath, locals[name]);
            references[name] = ref.split(path.sep).join('/');
        });
        if (data.name.indexOf('example-') === -1 &&
            Object.keys(references).length > 0) {
            const tsConfigPath = path.join(pkgPath, 'tsconfig.json');
            const tsConfigData = utils.readJSONFile(tsConfigPath);
            tsConfigData.references = [];
            Object.keys(references).forEach(name => {
                tsConfigData.references.push({ path: references[name] });
            });
            utils.writeJSONFile(tsConfigPath, tsConfigData);
        }
        // Ensure dependencies and dev dependencies.
        data.dependencies = deps;
        data.devDependencies = devDeps;
        if (Object.keys(data.dependencies).length === 0) {
            delete data.dependencies;
        }
        if (Object.keys(data.devDependencies).length === 0) {
            delete data.devDependencies;
        }
        if (utils.writePackageData(path.join(pkgPath, 'package.json'), data)) {
            messages.push('Updated package.json');
        }
        return messages;
    });
}
exports.ensurePackage = ensurePackage;
/**
 * Extract the module imports from a TypeScript source file.
 *
 * @param sourceFile - The path to the source file.
 *
 * @returns An array of package names.
 */
function getImports(sourceFile) {
    let imports = [];
    handleNode(sourceFile);
    function handleNode(node) {
        switch (node.kind) {
            case ts.SyntaxKind.ImportDeclaration:
                imports.push(node.moduleSpecifier.text);
                break;
            case ts.SyntaxKind.ImportEqualsDeclaration:
                imports.push(node.moduleReference.expression.text);
                break;
            default:
            // no-op
        }
        ts.forEachChild(node, handleNode);
    }
    return imports;
}
