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
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
const react_highlighter_1 = __importDefault(require("react-highlighter"));
const react_json_tree_1 = __importDefault(require("react-json-tree"));
/**
 * A component that renders JSON data as a collapsible tree.
 */
class Component extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { filter: '' };
        this.input = null;
        this.timer = 0;
    }
    componentDidMount() {
        /**
         * Stop propagation of keyboard events to JupyterLab
         */
        ReactDOM.findDOMNode(this.input).addEventListener('keydown', (event) => {
            event.stopPropagation();
        }, false);
    }
    componentWillUnmount() {
        ReactDOM.findDOMNode(this.input).removeEventListener('keydown', (event) => {
            event.stopPropagation();
        }, false);
    }
    render() {
        const { data, metadata } = this.props;
        const root = metadata && metadata.root ? metadata.root : 'root';
        const keyPaths = this.state.filter
            ? filterPaths(data, this.state.filter, [root])
            : [root];
        return (React.createElement("div", { style: { position: 'relative', width: '100%' } },
            React.createElement("input", { ref: ref => (this.input = ref), onChange: event => {
                    if (this.timer) {
                        window.clearTimeout(this.timer);
                    }
                    const filter = event.target.value;
                    this.timer = window.setTimeout(() => {
                        this.setState({ filter });
                        this.timer = 0;
                    }, 300);
                }, style: {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '33%',
                    maxWidth: 150,
                    zIndex: 10,
                    fontSize: 13,
                    padding: '4px 2px'
                }, type: "text", placeholder: "Filter..." }),
            React.createElement(react_json_tree_1.default, { data: data, collectionLimit: 100, theme: {
                    extend: theme,
                    // TODO: Use Jupyter Notebook's current CodeMirror theme vs. 'cm-s-ipython'
                    tree: `CodeMirror ${this.props.theme || 'cm-s-ipython'}`,
                    // valueLabel: 'cm-variable',
                    valueText: 'cm-string',
                    // nestedNodeLabel: 'cm-variable-2',
                    nestedNodeItemString: 'cm-comment',
                    // value: {},
                    // label: {},
                    // itemRange: {},
                    // nestedNode: {},
                    // nestedNodeItemType: {},
                    // nestedNodeChildren: {},
                    // rootNodeChildren: {},
                    arrowSign: { color: 'cm-variable' }
                }, invertTheme: false, keyPath: [root], labelRenderer: ([label, type]) => {
                    let className = 'cm-variable';
                    // if (type === 'root') className = 'cm-variable-2';
                    if (type === 'array') {
                        className = 'cm-variable-2';
                    }
                    if (type === 'object') {
                        className = 'cm-variable-3';
                    }
                    return (React.createElement("span", { className: className },
                        React.createElement(react_highlighter_1.default, { search: this.state.filter, matchStyle: { backgroundColor: 'yellow' } }, `${label}: `)));
                }, valueRenderer: raw => {
                    let className = 'cm-string';
                    if (typeof raw === 'number') {
                        className = 'cm-number';
                    }
                    if (raw === 'true' || raw === 'false') {
                        className = 'cm-keyword';
                    }
                    return (React.createElement("span", { className: className },
                        React.createElement(react_highlighter_1.default, { search: this.state.filter, matchStyle: { backgroundColor: 'yellow' } }, `${raw}`)));
                }, shouldExpandNode: (keyPath, data, level) => metadata && metadata.expanded
                    ? true
                    : keyPaths.join(',').includes(keyPath.join(',')) })));
    }
}
exports.Component = Component;
const theme = {
    scheme: 'jupyter',
    base00: '#fff',
    base01: '#fff',
    base02: '#d7d4f0',
    base03: '#408080',
    base04: '#b4b7b4',
    base05: '#c5c8c6',
    base06: '#d7d4f0',
    base07: '#fff',
    base08: '#000',
    base09: '#080',
    base0A: '#fba922',
    base0B: '#408080',
    base0C: '#aa22ff',
    base0D: '#00f',
    base0E: '#008000',
    base0F: '#00f'
};
function objectIncludes(data, query) {
    return JSON.stringify(data).includes(query);
}
function filterPaths(data, query, parent = ['root']) {
    if (Array.isArray(data)) {
        return data.reduce((result, item, index) => {
            if (item && typeof item === 'object' && objectIncludes(item, query)) {
                return [
                    ...result,
                    [index, ...parent].join(','),
                    ...filterPaths(item, query, [index, ...parent])
                ];
            }
            return result;
        }, []);
    }
    if (typeof data === 'object') {
        return Object.keys(data).reduce((result, key) => {
            let item = data[key];
            if (item &&
                typeof item === 'object' &&
                (key.includes(query) || objectIncludes(item, query))) {
                return [
                    ...result,
                    [key, ...parent].join(','),
                    ...filterPaths(item, query, [key, ...parent])
                ];
            }
            return result;
        }, []);
    }
}
