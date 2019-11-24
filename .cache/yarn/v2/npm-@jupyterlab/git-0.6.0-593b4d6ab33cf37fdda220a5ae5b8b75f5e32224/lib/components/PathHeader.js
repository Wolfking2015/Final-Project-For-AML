"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PathHeaderStyle_1 = require("../componentsStyle/PathHeaderStyle");
const React = require("react");
const typestyle_1 = require("typestyle");
const git_1 = require("../git");
const apputils_1 = require("@jupyterlab/apputils");
const gitPushPull_1 = require("../gitPushPull");
class PathHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refresh: props.refresh,
            gitApi: new git_1.Git()
        };
    }
    render() {
        let relativePath = this.props.currentFileBrowserPath.split('/');
        return (React.createElement("div", { className: PathHeaderStyle_1.repoStyle },
            React.createElement("span", { className: PathHeaderStyle_1.repoPathStyle }, relativePath[relativePath.length - 1] +
                ' / ' +
                this.props.currentBranch),
            React.createElement("button", { className: typestyle_1.classes(PathHeaderStyle_1.gitPullStyle, 'jp-Icon-16'), title: 'Pull latest changes', onClick: () => this.showGitPushPullDialog(this.props.currentFileBrowserPath, gitPushPull_1.Operation.Pull) }),
            React.createElement("button", { className: typestyle_1.classes(PathHeaderStyle_1.gitPushStyle, 'jp-Icon-16'), title: 'Push committed changes', onClick: () => this.showGitPushPullDialog(this.props.currentFileBrowserPath, gitPushPull_1.Operation.Push) }),
            React.createElement("button", { className: typestyle_1.classes(PathHeaderStyle_1.repoRefreshStyle, 'jp-Icon-16'), onClick: () => this.props.refresh() })));
    }
    /**
     * Displays the error dialog when the Git Push/Pull operation fails.
     * @param title the title of the error dialog
     * @param body the message to be shown in the body of the modal.
     */
    showGitPushPullDialog(currentFileBrowserPath, operation) {
        let dialog = new apputils_1.Dialog({
            title: `Git ${operation}`,
            body: new gitPushPull_1.GitPullPushDialog(currentFileBrowserPath, operation),
            buttons: [apputils_1.Dialog.okButton({ label: 'DISMISS' })]
        });
        return dialog.launch().then(() => { });
    }
}
exports.PathHeader = PathHeader;
