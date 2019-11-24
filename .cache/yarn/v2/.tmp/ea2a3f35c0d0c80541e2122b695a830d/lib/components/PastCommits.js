"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileList_1 = require("./FileList");
const PastCommitsStyle_1 = require("../componentsStyle/PastCommitsStyle");
const React = require("react");
class PastCommits extends React.Component {
    render() {
        if (this.props.sideBarExpanded) {
            return null;
        }
        return (React.createElement("div", { className: PastCommitsStyle_1.pastCommitsContainerStyle },
            React.createElement(FileList_1.FileList, { currentFileBrowserPath: this.props.currentFileBrowserPath, topRepoPath: this.props.topRepoPath, stagedFiles: this.props.stagedFiles, unstagedFiles: this.props.unstagedFiles, untrackedFiles: this.props.untrackedFiles, app: this.props.app, refresh: this.props.refresh, sideBarExpanded: this.props.sideBarExpanded, display: this.props.showList })));
    }
}
exports.PastCommits = PastCommits;
