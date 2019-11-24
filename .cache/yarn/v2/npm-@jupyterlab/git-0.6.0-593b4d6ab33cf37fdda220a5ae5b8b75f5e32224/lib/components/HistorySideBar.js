"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const HistorySideBarStyle_1 = require("../componentsStyle/HistorySideBarStyle");
const PastCommitNode_1 = require("./PastCommitNode");
class HistorySideBar extends React.Component {
    render() {
        if (!this.props.isExpanded) {
            return null;
        }
        return (React.createElement("div", { className: HistorySideBarStyle_1.historySideBarStyle }, this.props.pastCommits.map((pastCommit, pastCommitIndex) => (React.createElement(PastCommitNode_1.PastCommitNode, { key: pastCommitIndex, pastCommit: pastCommit, branches: this.props.branches, topRepoPath: this.props.topRepoPath, app: this.props.app, refresh: this.props.refresh, diff: this.props.diff })))));
    }
}
exports.HistorySideBar = HistorySideBar;
