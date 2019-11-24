"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const React = __importStar(require("react"));
const react_paginate_1 = __importDefault(require("react-paginate"));
const model_1 = require("./model");
const query_1 = require("./query");
// TODO: Replace pagination with lazy loading of lower search results
/**
 * Search bar VDOM component.
 */
class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
    }
    /**
     * Render the list view using the virtual DOM.
     */
    render() {
        return (React.createElement("div", { className: "jp-extensionmanager-search-bar" },
            React.createElement("div", { className: "jp-extensionmanager-search-wrapper" },
                React.createElement("input", { type: "text", className: "jp-extensionmanager-input", placeholder: this.props.placeholder, onChange: this.handleChange.bind(this), value: this.state.value }))));
    }
    /**
     * Handler for search input changes.
     */
    handleChange(e) {
        let target = e.target;
        this.setState({
            value: target.value
        });
    }
}
exports.SearchBar = SearchBar;
/**
 * Create a build prompt as a react element.
 *
 * @param props Configuration of the build prompt.
 */
function BuildPrompt(props) {
    return (React.createElement("div", { className: "jp-extensionmanager-buildprompt" },
        React.createElement("div", { className: "jp-extensionmanager-buildmessage" }, "A build is needed to include the latest changes"),
        React.createElement("button", { className: "jp-extensionmanager-rebuild", onClick: props.performBuild }, "Rebuild"),
        React.createElement("button", { className: "jp-extensionmanager-ignorebuild", onClick: props.ignoreBuild }, "Ignore")));
}
/**
 * VDOM for visualizing an extension entry.
 */
function ListEntry(props) {
    const { entry } = props;
    const flagClasses = [];
    if (entry.installed) {
        flagClasses.push('jp-extensionmanager-entry-installed');
    }
    if (entry.enabled) {
        flagClasses.push('jp-extensionmanager-entry-enabled');
    }
    if (model_1.ListModel.entryHasUpdate(entry)) {
        flagClasses.push('jp-extensionmanager-entry-update');
    }
    if (entry.status && ['ok', 'warning', 'error'].indexOf(entry.status) !== -1) {
        flagClasses.push(`jp-extensionmanager-entry-${entry.status}`);
    }
    let title = entry.name;
    if (query_1.isJupyterOrg(entry.name)) {
        flagClasses.push(`jp-extensionmanager-entry-mod-whitelisted`);
        title = `${entry.name} (Developed by Project Jupyter)`;
    }
    return (React.createElement("li", { className: `jp-extensionmanager-entry ${flagClasses.join(' ')}`, title: title },
        React.createElement("div", { className: "jp-extensionmanager-entry-title" },
            React.createElement("div", { className: "jp-extensionmanager-entry-name" },
                React.createElement("a", { href: entry.url, target: "_blank" }, entry.name)),
            React.createElement("div", { className: "jp-extensionmanager-entry-jupyter-org" })),
        React.createElement("div", { className: "jp-extensionmanager-entry-content" },
            React.createElement("div", { className: "jp-extensionmanager-entry-description" }, entry.description),
            React.createElement("div", { className: "jp-extensionmanager-entry-buttons" },
                React.createElement("button", { className: "jp-extensionmanager-install", onClick: () => props.performAction('install', entry) }, "Install"),
                React.createElement("button", { className: "jp-extensionmanager-update", 
                    // An install action will update the extension:
                    onClick: () => props.performAction('install', entry) }, "Update"),
                React.createElement("button", { className: "jp-extensionmanager-uninstall", onClick: () => props.performAction('uninstall', entry) }, "Uninstall"),
                React.createElement("button", { className: "jp-extensionmanager-enable", onClick: () => props.performAction('enable', entry) }, "Enable"),
                React.createElement("button", { className: "jp-extensionmanager-disable", onClick: () => props.performAction('disable', entry) }, "Disable")))));
}
/**
 * List view widget for extensions
 */
function ListView(props) {
    const entryViews = [];
    for (let entry of props.entries) {
        entryViews.push(React.createElement(ListEntry, { entry: entry, key: entry.name, performAction: props.performAction }));
    }
    let pagination;
    if (props.numPages > 1) {
        pagination = (React.createElement("div", { className: "jp-extensionmanager-pagination" },
            React.createElement(react_paginate_1.default, { previousLabel: '<', nextLabel: '>', breakLabel: React.createElement("a", { href: "" }, "..."), breakClassName: 'break-me', pageCount: props.numPages, marginPagesDisplayed: 2, pageRangeDisplayed: 5, onPageChange: (data) => props.onPage(data.selected), containerClassName: 'pagination', activeClassName: 'active' })));
    }
    const listview = (React.createElement("ul", { className: "jp-extensionmanager-listview" }, entryViews));
    return (React.createElement("div", { className: "jp-extensionmanager-listview-wrapper" },
        entryViews.length > 0 ? (listview) : (React.createElement("div", { key: "message", className: "jp-extensionmanager-listview-message" }, "No entries")),
        pagination));
}
exports.ListView = ListView;
/**
 *
 *
 * @param {RefreshButton.IProperties} props
 * @returns {React.ReactElement<any>}
 */
function RefreshButton(props) {
    return (React.createElement(apputils_1.ToolbarButtonComponent, { key: "refreshButton", className: "jp-extensionmanager-refresh", iconClassName: "jp-RefreshIcon jp-Icon jp-Icon-16", onClick: props.onClick, tooltip: "Refresh extension list" }));
}
function ErrorMessage(props) {
    return (React.createElement("div", { key: "error-msg", className: "jp-extensionmanager-error" }, props.children));
}
/**
 *
 */
class CollapsibleSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: props.startCollapsed
        };
    }
    /**
     * Render the collapsible section using the virtual DOM.
     */
    render() {
        const elements = [
            React.createElement("header", { key: "header" },
                React.createElement(apputils_1.ToolbarButtonComponent, { key: "collapser", iconClassName: 'jp-Icon jp-Icon-16 ' +
                        (this.state.collapsed
                            ? 'jp-extensionmanager-collapseIcon'
                            : 'jp-extensionmanager-expandIcon'), className: 'jp-collapser-button', onClick: () => {
                        this.onCollapse();
                    } }),
                React.createElement("span", { className: "jp-extensionmanager-headerText" }, this.props.header),
                this.props.headerElements)
        ];
        if (!this.state.collapsed) {
            if (Array.isArray(this.props.children)) {
                elements.push(...this.props.children);
            }
            else {
                elements.push(this.props.children);
            }
        }
        return elements;
    }
    /**
     * Handler for search input changes.
     */
    onCollapse() {
        if (this.props.onCollapse !== undefined) {
            this.props.onCollapse(!this.state.collapsed);
        }
        this.setState({
            collapsed: !this.state.collapsed
        });
    }
}
exports.CollapsibleSection = CollapsibleSection;
/**
 * The main view for the discovery extension.
 */
class ExtensionView extends apputils_1.VDomRenderer {
    constructor(serviceManager) {
        super();
        this.model = new model_1.ListModel(serviceManager);
        this.addClass('jp-extensionmanager-view');
    }
    /**
     * The search input node.
     */
    get inputNode() {
        return this.node.getElementsByClassName('jp-extensionmanager-input')[0];
    }
    /**
     * Render the extension view using the virtual DOM.
     */
    render() {
        const model = this.model;
        let pages = Math.ceil(model.totalEntries / model.pagination);
        let elements = [React.createElement(SearchBar, { key: "searchbar", placeholder: "SEARCH" })];
        if (model.promptBuild) {
            elements.push(React.createElement(BuildPrompt, { key: "buildpromt", performBuild: () => {
                    model.performBuild();
                }, ignoreBuild: () => {
                    model.ignoreBuildRecommendation();
                } }));
        }
        // Indicator element for pending actions:
        elements.push(React.createElement("div", { key: "pending", className: `jp-extensionmanager-pending ${model.hasPendingActions() ? 'jp-mod-hasPending' : ''}` }));
        const content = [];
        if (!model.initialized) {
            model.initialize();
            content.push(React.createElement("div", { key: "loading-placeholder", className: "jp-extensionmanager-loader" }, "Updating extensions list"));
        }
        else if (model.serverConnectionError !== null) {
            content.push(React.createElement(ErrorMessage, { key: "error-msg" },
                React.createElement("p", null, "Error communicating with server extension. Consult the documentation for how to ensure that it is enabled."),
                React.createElement("p", null, "Reason given:"),
                React.createElement("pre", null, model.serverConnectionError)));
        }
        else if (model.serverRequirementsError !== null) {
            content.push(React.createElement(ErrorMessage, { key: "error-msg" },
                React.createElement("p", null, "The server has some missing requirements for installing extensions."),
                React.createElement("p", null, "Details:"),
                React.createElement("pre", null, model.serverRequirementsError)));
        }
        else {
            // List installed and discovery sections
            let installedContent = [];
            if (model.installedError !== null) {
                installedContent.push(React.createElement(ErrorMessage, null, `Error querying installed extensions${model.installedError ? `: ${model.installedError}` : '.'}`));
            }
            else {
                installedContent.push(React.createElement(ListView, { entries: model.installed, numPages: 1, onPage: value => {
                        /* no-op */
                    }, performAction: this.onAction.bind(this) }));
            }
            content.push(React.createElement(CollapsibleSection, { header: "Installed", key: "installed-section", startCollapsed: false, headerElements: React.createElement(RefreshButton, { onClick: () => {
                        model.refreshInstalled();
                    } }) }, installedContent));
            let searchContent = [];
            if (model.searchError !== null) {
                searchContent.push(React.createElement(ErrorMessage, null, `Error searching for extensions${model.searchError ? `: ${model.searchError}` : '.'}`));
            }
            else {
                searchContent.push(React.createElement(ListView
                // Filter out installed extensions:
                , { 
                    // Filter out installed extensions:
                    entries: model.searchResult.filter(entry => model.installed.indexOf(entry) === -1), numPages: pages, onPage: value => {
                        this.onPage(value);
                    }, performAction: this.onAction.bind(this) }));
            }
            content.push(React.createElement(CollapsibleSection, { header: model.query ? 'Search Results' : 'Discover', key: "search-section", startCollapsed: true, onCollapse: (collapsed) => {
                    if (!collapsed && model.query === null) {
                        model.query = '';
                    }
                } }, searchContent));
        }
        elements.push(React.createElement("div", { key: "content", className: "jp-extensionmanager-content" }, content));
        return elements;
    }
    /**
     * Callback handler for the user specifies a new search query.
     *
     * @param value The new query.
     */
    onSearch(value) {
        this.model.query = value;
    }
    /**
     * Callback handler for the user changes the page of the search result pagination.
     *
     * @param value The pagination page number.
     */
    onPage(value) {
        this.model.page = value;
    }
    /**
     * Callback handler for when the user wants to perform an action on an extension.
     *
     * @param action The action to perform.
     * @param entry The entry to perform the action on.
     */
    onAction(action, entry) {
        switch (action) {
            case 'install':
                return this.model.install(entry);
            case 'uninstall':
                return this.model.uninstall(entry);
            case 'enable':
                return this.model.enable(entry);
            case 'disable':
                return this.model.disable(entry);
            default:
                throw new Error(`Invalid action: ${action}`);
        }
    }
    /**
     * Handle the DOM events for the command palette.
     *
     * @param event - The DOM event sent to the command palette.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the command palette's DOM node.
     * It should not be called directly by user code.
     */
    handleEvent(event) {
        switch (event.type) {
            case 'input':
                this.onSearch(this.inputNode.value);
                break;
            case 'focus':
            case 'blur':
                this._toggleFocused();
                break;
            default:
                break;
        }
    }
    /**
     * A message handler invoked on a `'before-attach'` message.
     */
    onBeforeAttach(msg) {
        this.node.addEventListener('input', this);
        this.node.addEventListener('focus', this, true);
        this.node.addEventListener('blur', this, true);
    }
    /**
     * A message handler invoked on an `'after-detach'` message.
     */
    onAfterDetach(msg) {
        this.node.removeEventListener('input', this);
        this.node.removeEventListener('focus', this, true);
        this.node.removeEventListener('blur', this, true);
    }
    /**
     * A message handler invoked on an `'activate-request'` message.
     */
    onActivateRequest(msg) {
        if (this.isAttached) {
            let input = this.inputNode;
            input.focus();
            input.select();
        }
    }
    /**
     * Toggle the focused modifier based on the input node focus state.
     */
    _toggleFocused() {
        let focused = document.activeElement === this.inputNode;
        this.toggleClass('p-mod-focused', focused);
    }
}
exports.ExtensionView = ExtensionView;
