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
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
const algorithm_1 = require("@phosphor/algorithm");
const signaling_1 = require("@phosphor/signaling");
const widgets_1 = require("@phosphor/widgets");
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@jupyterlab/coreutils");
require("../style/index.css");
/**
 * The class name added to a running widget.
 */
const RUNNING_CLASS = 'jp-RunningSessions';
/**
 * The class name added to a running widget header.
 */
const HEADER_CLASS = 'jp-RunningSessions-header';
/**
 * The class name added to the running terminal sessions section.
 */
const SECTION_CLASS = 'jp-RunningSessions-section';
/**
 * The class name added to the running sessions section header.
 */
const SECTION_HEADER_CLASS = 'jp-RunningSessions-sectionHeader';
/**
 * The class name added to a section container.
 */
const CONTAINER_CLASS = 'jp-RunningSessions-sectionContainer';
/**
 * The class name added to the running kernel sessions section list.
 */
const LIST_CLASS = 'jp-RunningSessions-sectionList';
/**
 * The class name added to the running sessions items.
 */
const ITEM_CLASS = 'jp-RunningSessions-item';
/**
 * The class name added to a running session item icon.
 */
const ITEM_ICON_CLASS = 'jp-RunningSessions-itemIcon';
/**
 * The class name added to a running session item label.
 */
const ITEM_LABEL_CLASS = 'jp-RunningSessions-itemLabel';
/**
 * The class name added to a running session item shutdown button.
 */
const SHUTDOWN_BUTTON_CLASS = 'jp-RunningSessions-itemShutdown';
/**
 * The class name added to a notebook icon.
 */
const NOTEBOOK_ICON_CLASS = 'jp-mod-notebook';
/**
 * The class name added to a console icon.
 */
const CONSOLE_ICON_CLASS = 'jp-mod-console';
/**
 * The class name added to a file icon.
 */
const FILE_ICON_CLASS = 'jp-mod-file';
/**
 * The class name added to a terminal icon.
 */
const TERMINAL_ICON_CLASS = 'jp-mod-terminal';
function Item(props) {
    const { model } = props;
    return (React.createElement("li", { className: ITEM_CLASS },
        React.createElement("span", { className: `${ITEM_ICON_CLASS} ${props.iconClass(model)}` }),
        React.createElement("span", { className: ITEM_LABEL_CLASS, title: props.labelTitle ? props.labelTitle(model) : '', onClick: () => props.openRequested.emit(model) }, props.label(model)),
        React.createElement("button", { className: `${SHUTDOWN_BUTTON_CLASS} jp-mod-styled`, onClick: () => props.shutdown(model) }, "SHUTDOWN")));
}
class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = { models: algorithm_1.toArray(props.manager.running()) };
    }
    render() {
        return (React.createElement("ul", { className: LIST_CLASS }, this.state.models.map((m, i) => (React.createElement(Item, Object.assign({ key: i, model: m }, this.props))))));
    }
    componentDidMount() {
        if (this.props.available) {
            this.props.manager.runningChanged.connect((_, models) => this.setState({
                models: models.filter(this.props.filterRunning || (_ => true))
            }));
        }
    }
}
/**
 * The Section component contains the shared look and feel for an interactive list of kernels and sessions.
 *
 * It is specialized for each based on it's props.
 */
function Section(props) {
    function onShutdown() {
        apputils_1.showDialog({
            title: `Shutdown All ${props.name} Sessions?`,
            buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton({ label: 'SHUTDOWN' })]
        }).then(result => {
            if (result.button.accept) {
                props.manager.shutdownAll();
            }
        });
    }
    return (React.createElement("div", { className: SECTION_CLASS }, props.available && (React.createElement(React.Fragment, null,
        React.createElement("header", { className: SECTION_HEADER_CLASS },
            React.createElement("h2", null,
                props.name,
                " Sessions"),
            React.createElement(apputils_1.ToolbarButtonComponent, { tooltip: `Shutdown All ${props.name} Sessions…`, iconClassName: "jp-CloseIcon jp-Icon jp-Icon-16", onClick: onShutdown })),
        React.createElement("div", { className: CONTAINER_CLASS },
            React.createElement(List, Object.assign({}, props)))))));
}
function RunningSessionsComponent({ manager, sessionOpenRequested, terminalOpenRequested }) {
    const terminalsAvailable = manager.terminals.isAvailable();
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: HEADER_CLASS },
            React.createElement(apputils_1.ToolbarButtonComponent, { tooltip: "Refresh List", iconClassName: "jp-RefreshIcon jp-Icon jp-Icon-16", onClick: () => {
                    if (terminalsAvailable) {
                        manager.terminals.refreshRunning();
                    }
                    manager.sessions.refreshRunning();
                } })),
        React.createElement(Section, { openRequested: terminalOpenRequested, manager: manager.terminals, name: "Terminal", iconClass: () => `${ITEM_ICON_CLASS} ${TERMINAL_ICON_CLASS}`, label: m => `terminals/${m.name}`, available: terminalsAvailable, shutdown: m => manager.terminals.shutdown(m.name) }),
        React.createElement(Section, { openRequested: sessionOpenRequested, manager: manager.sessions, filterRunning: m => !!((m.name || coreutils_1.PathExt.basename(m.path)).indexOf('.') !== -1 || m.name), name: "Kernel", iconClass: m => {
                if ((m.name || coreutils_1.PathExt.basename(m.path)).indexOf('.ipynb') !== -1) {
                    return NOTEBOOK_ICON_CLASS;
                }
                else if (m.type.toLowerCase() === 'console') {
                    return CONSOLE_ICON_CLASS;
                }
                return FILE_ICON_CLASS;
            }, label: m => m.name || coreutils_1.PathExt.basename(m.path), available: true, labelTitle: m => {
                let kernelName = m.kernel.name;
                if (manager.specs) {
                    kernelName = manager.specs.kernelspecs[kernelName].display_name;
                }
                return `Path: ${m.path}\nKernel: ${kernelName}`;
            }, shutdown: m => manager.sessions.shutdown(m.id) })));
}
/**
 * A class that exposes the running terminal and kernel sessions.
 */
class RunningSessions extends widgets_1.Widget {
    /**
     * Construct a new running widget.
     */
    constructor(options) {
        super();
        this._sessionOpenRequested = new signaling_1.Signal(this);
        this._terminalOpenRequested = new signaling_1.Signal(this);
        this.options = options;
        // this can't be in the react element, because then it would be too nested
        this.addClass(RUNNING_CLASS);
    }
    onUpdateRequest(msg) {
        ReactDOM.render(React.createElement(RunningSessionsComponent, { manager: this.options.manager, sessionOpenRequested: this._sessionOpenRequested, terminalOpenRequested: this._terminalOpenRequested }), this.node);
    }
    /* Called after the widget is attached to the DOM
     *
     * Make sure the widget is rendered, even if the model has not changed.
     */
    onAfterAttach(msg) {
        this.update();
    }
    /**
     * A signal emitted when a kernel session open is requested.
     */
    get sessionOpenRequested() {
        return this._sessionOpenRequested;
    }
    /**
     * A signal emitted when a terminal session open is requested.
     */
    get terminalOpenRequested() {
        return this._terminalOpenRequested;
    }
}
exports.RunningSessions = RunningSessions;
