"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
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
const apputils_1 = require("@jupyterlab/apputils");
const services_1 = require("@jupyterlab/services");
const semver = __importStar(require("semver"));
const build_helper_1 = require("./build-helper");
const companions_1 = require("./companions");
const dialog_1 = require("./dialog");
const query_1 = require("./query");
/**
 * The server API path for querying/modifying installed extensions.
 */
const EXTENSION_API_PATH = 'lab/api/extensions';
/**
 * Model for an extension list.
 */
class ListModel extends apputils_1.VDomModel {
    constructor(serviceManager) {
        super();
        /**
         * Contains an error message if an error occurred when querying installed extensions.
         */
        this.installedError = null;
        /**
         * Contains an error message if an error occurred when searching for extensions.
         */
        this.searchError = null;
        /**
         * Contains an error message if an error occurred when querying the server extension.
         */
        this.serverConnectionError = null;
        /**
         * Contains an error message if the server has unfulfilled requirements.
         */
        this.serverRequirementsError = null;
        /**
         * Whether the model has finished async initialization.
         */
        this.initialized = false;
        /**
         * Whether a fresh build should be considered due to actions taken.
         */
        this.promptBuild = false;
        /**
         * A helper for performing searches of jupyterlab extensions on the NPM repository.
         */
        this.searcher = new query_1.Searcher();
        this._query = null;
        this._page = 0;
        this._pagination = 250;
        this._totalEntries = 0;
        this._pendingActions = [];
        this._installed = [];
        this._searchResult = [];
        this.serviceManager = serviceManager;
        this.serverConnectionSettings = services_1.ServerConnection.makeSettings();
    }
    /**
     * A readonly array of the installed extensions.
     */
    get installed() {
        return this._installed;
    }
    /**
     * A readonly array containing the latest search result
     */
    get searchResult() {
        return this._searchResult;
    }
    /**
     * The current NPM repository search query.
     *
     * Setting its value triggers a new search.
     */
    get query() {
        return this._query;
    }
    set query(value) {
        this._query = value;
        this.update();
    }
    /**
     * The current NPM repository search page.
     *
     * The npm repository search is paginated by the `pagination` attribute.
     * The `page` value selects which page is used.
     *
     * Setting its value triggers a new search.
     */
    get page() {
        return this._page;
    }
    set page(value) {
        this._page = value;
        this.update();
    }
    /**
     * The NPM repository search pagination.
     *
     * The npm repository search is paginated by the `pagination` attribute.
     * The `page` value selects which page is used.
     *
     * Setting its value triggers a new search.
     */
    get pagination() {
        return this._pagination;
    }
    set pagination(value) {
        this._pagination = value;
        this.update();
    }
    /**
     * The total number of results in the current search.
     */
    get totalEntries() {
        return this._totalEntries;
    }
    /**
     * Initialize the model.
     */
    initialize() {
        this.update()
            .then(() => {
            this.initialized = true;
            this.stateChanged.emit(undefined);
        })
            .catch(() => {
            this.initialized = true;
            this.stateChanged.emit(undefined);
        });
    }
    /**
     * Whether there are currently any actions pending.
     */
    hasPendingActions() {
        return this._pendingActions.length > 0;
    }
    /**
     * Install an extension.
     *
     * @param entry An entry indicating which extension to install.
     */
    install(entry) {
        if (entry.installed) {
            // Updating
            return this._performAction('install', entry).then(data => {
                if (data.status !== 'ok') {
                    dialog_1.reportInstallError(entry.name, data.message);
                }
                this.update();
            });
        }
        this.checkCompanionPackages(entry).then(shouldInstall => {
            if (shouldInstall) {
                return this._performAction('install', entry).then(data => {
                    if (data.status !== 'ok') {
                        dialog_1.reportInstallError(entry.name, data.message);
                    }
                    this.update();
                });
            }
        });
    }
    /**
     * Uninstall an extension.
     *
     * @param entry An entry indicating which extension to uninstall.
     */
    uninstall(entry) {
        if (!entry.installed) {
            throw new Error(`Not installed, cannot uninstall: ${entry.name}`);
        }
        this._performAction('uninstall', entry).then(data => {
            this.update();
        });
    }
    /**
     * Enable an extension.
     *
     * @param entry An entry indicating which extension to enable.
     */
    enable(entry) {
        if (entry.enabled) {
            throw new Error(`Already enabled: ${entry.name}`);
        }
        this._performAction('enable', entry).then(data => {
            this.update();
        });
    }
    /**
     * Disable an extension.
     *
     * @param entry An entry indicating which extension to disable.
     */
    disable(entry) {
        if (!entry.enabled) {
            throw new Error(`Already disabled: ${entry.name}`);
        }
        this._performAction('disable', entry).then(data => {
            this.update();
        });
    }
    /**
     * Check for companion packages in kernels or server.
     *
     * @param entry An entry indicating which extension to check.
     */
    checkCompanionPackages(entry) {
        return this.searcher
            .fetchPackageData(entry.name, entry.latest_version)
            .then(data => {
            if (!data || !data.jupyterlab || !data.jupyterlab.discovery) {
                return true;
            }
            let discovery = data.jupyterlab.discovery;
            let kernelCompanions = [];
            if (discovery.kernel) {
                // match specs
                for (let kernelInfo of discovery.kernel) {
                    let matches = Private.matchSpecs(kernelInfo, this.serviceManager.specs);
                    kernelCompanions.push({ kernelInfo, kernels: matches });
                }
            }
            if (kernelCompanions.length < 1 && !discovery.server) {
                return true;
            }
            return companions_1.presentCompanions(kernelCompanions, discovery.server);
        });
    }
    /**
     * Trigger a build check to incorporate actions taken.
     */
    triggerBuildCheck() {
        let builder = this.serviceManager.builder;
        if (builder.isAvailable && !this.promptBuild) {
            const completed = builder.getStatus().then(response => {
                if (response.status === 'building') {
                    // Piggy-back onto existing build
                    // TODO: Can this cause dialog collision on build completion?
                    return build_helper_1.doBuild(builder);
                }
                if (response.status !== 'needed') {
                    return;
                }
                if (!this.promptBuild) {
                    this.promptBuild = true;
                    this.stateChanged.emit(undefined);
                }
            });
            this._addPendingAction(completed);
        }
    }
    /**
     * Perform a build on the server
     */
    performBuild() {
        if (this.promptBuild) {
            this.promptBuild = false;
            this.stateChanged.emit(undefined);
        }
        const completed = build_helper_1.doBuild(this.serviceManager.builder);
        this._addPendingAction(completed);
    }
    /**
     * Ignore a build recommendation
     */
    ignoreBuildRecommendation() {
        if (this.promptBuild) {
            this.promptBuild = false;
            this.stateChanged.emit(undefined);
        }
    }
    /**
     * Ignore a build recommendation
     */
    refreshInstalled() {
        const refresh = this.update(true);
        this._addPendingAction(refresh);
    }
    /**
     * Translate search results from an npm repository query into entries
     * and remove entries with 'deprecated' in the keyword list
     *
     * @param res Promise to an npm query result.
     */
    translateSearchResult(res) {
        return __awaiter(this, void 0, void 0, function* () {
            let entries = {};
            for (let obj of (yield res).objects) {
                let pkg = obj.package;
                if (pkg.keywords.indexOf('deprecated') >= 0) {
                    continue;
                }
                entries[pkg.name] = {
                    name: pkg.name,
                    description: pkg.description,
                    url: 'homepage' in pkg.links
                        ? pkg.links.homepage
                        : 'repository' in pkg.links
                            ? pkg.links.repository
                            : pkg.links.npm,
                    installed: false,
                    enabled: false,
                    status: null,
                    latest_version: pkg.version,
                    installed_version: ''
                };
            }
            return entries;
        });
    }
    /**
     * Translate installed extensions information from the server into entries.
     *
     * @param res Promise to the server reply data.
     */
    translateInstalled(res) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            const entries = {};
            for (let pkg of yield res) {
                promises.push(res.then(info => {
                    entries[pkg.name] = {
                        name: pkg.name,
                        description: pkg.description,
                        url: pkg.url,
                        installed: pkg.installed !== false,
                        enabled: pkg.enabled,
                        status: pkg.status,
                        latest_version: pkg.latest_version,
                        installed_version: pkg.installed_version
                    };
                }));
            }
            return Promise.all(promises).then(() => {
                return entries;
            });
        });
    }
    /**
     * Make a request to the server for info about its installed extensions.
     */
    fetchInstalled(refreshInstalled = false) {
        const url = new URL(EXTENSION_API_PATH, this.serverConnectionSettings.baseUrl);
        if (refreshInstalled) {
            url.searchParams.append('refresh', '1');
        }
        const request = services_1.ServerConnection.makeRequest(url.toString(), {}, this.serverConnectionSettings).then(response => {
            Private.handleError(response);
            return response.json();
        });
        request.then(() => {
            this.serverConnectionError = null;
        }, reason => {
            this.serverConnectionError = reason.toString();
        });
        return request;
    }
    /**
     * Search with current query.
     *
     * Sets searchError and totalEntries as appropriate.
     *
     * @returns {Promise<{ [key: string]: IEntry; }>} The search result as a map of entries.
     */
    performSearch() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.query === null) {
                this._searchResult = [];
                this._totalEntries = 0;
                this.searchError = null;
                return {};
            }
            // Start the search without waiting for it:
            let search = this.searcher.searchExtensions(this.query, this.page, this.pagination);
            let searchMapPromise = this.translateSearchResult(search);
            let searchMap;
            try {
                searchMap = yield searchMapPromise;
                this.searchError = null;
            }
            catch (reason) {
                searchMap = {};
                this.searchError = reason.toString();
            }
            try {
                this._totalEntries = (yield search).total;
            }
            catch (error) {
                this._totalEntries = 0;
            }
            return searchMap;
        });
    }
    /**
     * Query the installed extensions.
     *
     * Sets installedError as appropriate.
     *
     * @returns {Promise<{ [key: string]: IEntry; }>} A map of installed extensions.
     */
    queryInstalled(refreshInstalled) {
        return __awaiter(this, void 0, void 0, function* () {
            let installedMap;
            try {
                installedMap = yield this.translateInstalled(this.fetchInstalled(refreshInstalled));
                this.installedError = null;
            }
            catch (reason) {
                installedMap = {};
                this.installedError = reason.toString();
            }
            return installedMap;
        });
    }
    /**
     * Update the current model.
     *
     * This will query the NPM repository, and the notebook server.
     *
     * Emits the `stateChanged` signal on successful completion.
     */
    update(refreshInstalled = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // Start both queries before awaiting:
            const searchMapPromise = this.performSearch();
            const installedMapPromise = this.queryInstalled(refreshInstalled);
            // Await results:
            const searchMap = yield searchMapPromise;
            const installedMap = yield installedMapPromise;
            // Map results to attributes:
            let installed = [];
            for (let key of Object.keys(installedMap)) {
                installed.push(installedMap[key]);
            }
            this._installed = installed.sort(Private.comparator);
            let searchResult = [];
            for (let key of Object.keys(searchMap)) {
                // Filter out installed entries from search results:
                if (installedMap[key] === undefined) {
                    searchResult.push(searchMap[key]);
                }
                else {
                    searchResult.push(installedMap[key]);
                }
            }
            this._searchResult = searchResult.sort(Private.comparator);
            // Signal updated state
            this.stateChanged.emit(undefined);
        });
    }
    /**
     * Send a request to the server to perform an action on an extension.
     *
     * @param action A valid action to perform.
     * @param entry The extension to perform the action on.
     */
    _performAction(action, entry) {
        const url = new URL(EXTENSION_API_PATH, this.serverConnectionSettings.baseUrl);
        let request = {
            method: 'POST',
            body: JSON.stringify({
                cmd: action,
                extension_name: entry.name
            })
        };
        const completed = services_1.ServerConnection.makeRequest(url.toString(), request, this.serverConnectionSettings).then(response => {
            Private.handleError(response);
            this.triggerBuildCheck();
            return response.json();
        });
        completed.then(() => {
            this.serverConnectionError = null;
        }, reason => {
            this.serverConnectionError = reason.toString();
        });
        this._addPendingAction(completed);
        return completed;
    }
    /**
     * Add a pending action.
     *
     * @param pending A promise that resolves when the action is completed.
     */
    _addPendingAction(pending) {
        // Add to pending actions collection
        this._pendingActions.push(pending);
        // Ensure action is removed when resolved
        const remove = () => {
            const i = this._pendingActions.indexOf(pending);
            this._pendingActions.splice(i, 1);
            this.stateChanged.emit(undefined);
        };
        pending.then(remove, remove);
        // Signal changed state
        this.stateChanged.emit(undefined);
    }
}
exports.ListModel = ListModel;
/**
 * ListModel statics.
 */
(function (ListModel) {
    /**
     * Utility function to check whether an entry can be updated.
     *
     * @param entry The entry to check.
     */
    function entryHasUpdate(entry) {
        if (!entry.installed || !entry.latest_version) {
            return false;
        }
        return semver.lt(entry.installed_version, entry.latest_version);
    }
    ListModel.entryHasUpdate = entryHasUpdate;
})(ListModel = exports.ListModel || (exports.ListModel = {}));
/**
 * A namespace for private functionality.
 */
var Private;
(function (Private) {
    /**
     * A comparator function that sorts whitelisted orgs to the top.
     */
    function comparator(a, b) {
        if (a.name === b.name) {
            return 0;
        }
        let testA = query_1.isJupyterOrg(a.name);
        let testB = query_1.isJupyterOrg(b.name);
        if (testA === testB) {
            return a.name.localeCompare(b.name);
        }
        else if (testA && !testB) {
            return -1;
        }
        else {
            return 1;
        }
    }
    Private.comparator = comparator;
    /**
     * Match kernel specs against kernel spec regexps
     *
     * @param kernelInfo The info containing the regexp patterns
     * @param specs The available kernel specs.
     */
    function matchSpecs(kernelInfo, specs) {
        if (!specs) {
            return [];
        }
        let matches = [];
        let reLang = null;
        let reName = null;
        if (kernelInfo.kernel_spec.language) {
            reLang = new RegExp(kernelInfo.kernel_spec.language);
        }
        if (kernelInfo.kernel_spec.display_name) {
            reName = new RegExp(kernelInfo.kernel_spec.display_name);
        }
        for (let key of Object.keys(specs.kernelspecs)) {
            let spec = specs.kernelspecs[key];
            let match = false;
            if (reLang) {
                match = reLang.test(spec.language);
            }
            if (!match && reName) {
                match = reName.test(spec.display_name);
            }
            if (match) {
                matches.push(spec);
                continue;
            }
        }
        return matches;
    }
    Private.matchSpecs = matchSpecs;
    /**
     * Convert a response to an exception on error.
     *
     * @param response The response to inspect.
     */
    function handleError(response) {
        if (!response.ok) {
            throw new Error(`${response.status} (${response.statusText})`);
        }
        return response;
    }
    Private.handleError = handleError;
})(Private || (Private = {}));
