"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const git_1 = require("../git");
const CommitBox_1 = require("./CommitBox");
const NewBranchBox_1 = require("./NewBranchBox");
const BranchHeaderStyle_1 = require("../componentsStyle/BranchHeaderStyle");
const typestyle_1 = require("typestyle");
const apputils_1 = require("@jupyterlab/apputils");
class BranchHeader extends React.Component {
    constructor(props) {
        super(props);
        /** Commit all staged files */
        this.commitAllStagedFiles = (message, path) => {
            if (message && message !== '') {
                let gitApi = new git_1.Git();
                gitApi.commit(message, path).then(response => {
                    this.props.refresh();
                });
            }
        };
        this.createNewBranch = (branchName) => __awaiter(this, void 0, void 0, function* () {
            let gitApi = new git_1.Git();
            yield gitApi.checkout(true, true, branchName, false, null, this.props.currentFileBrowserPath);
            this.toggleNewBranchBox();
            this.props.refresh();
        });
        this.toggleNewBranchBox = () => {
            this.props.refresh();
            if (!this.props.disabled) {
                this.setState({
                    showNewBranchBox: !this.state.showNewBranchBox,
                    dropdownOpen: false
                });
            }
            else {
                apputils_1.showErrorMessage('Creating new branch disabled', {
                    message: 'You have staged changes in current branch. Please commit / discard them before creating a new branch.'
                });
            }
        };
        this.state = {
            dropdownOpen: false,
            showCommitBox: true,
            showNewBranchBox: false
        };
    }
    /** Update state of commit message input box */
    updateCommitBoxState(disable, numberOfFiles) {
        if (disable) {
            if (numberOfFiles === 0) {
                return typestyle_1.classes(BranchHeaderStyle_1.stagedCommitButtonStyle, BranchHeaderStyle_1.stagedCommitButtonDisabledStyle);
            }
            else {
                return typestyle_1.classes(BranchHeaderStyle_1.stagedCommitButtonStyle, BranchHeaderStyle_1.stagedCommitButtonReadyStyle);
            }
        }
        else {
            return BranchHeaderStyle_1.stagedCommitButtonStyle;
        }
    }
    /** Switch current working branch */
    switchBranch(branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            let gitApi = new git_1.Git();
            yield gitApi.checkout(true, false, branchName, false, null, this.props.currentFileBrowserPath);
            this.toggleSelect();
            this.props.refresh();
        });
    }
    toggleSelect() {
        this.props.refresh();
        if (!this.props.disabled) {
            this.setState({
                showCommitBox: !this.state.showCommitBox,
                dropdownOpen: !this.state.dropdownOpen
            });
        }
        else {
            apputils_1.showErrorMessage('Switching branch disabled', {
                message: 'You have staged changes in current branch. Please commit / discard them before switching to another branch.'
            });
        }
    }
    getBranchStyle() {
        if (this.state.dropdownOpen) {
            return typestyle_1.classes(BranchHeaderStyle_1.branchStyle, BranchHeaderStyle_1.expandedBranchStyle);
        }
        else {
            return this.props.showList
                ? BranchHeaderStyle_1.branchStyle
                : typestyle_1.classes(BranchHeaderStyle_1.branchStyle, BranchHeaderStyle_1.smallBranchStyle);
        }
    }
    getHistoryHeaderStyle() {
        if (this.props.sideBarExpanded) {
            return typestyle_1.classes(BranchHeaderStyle_1.openHistorySideBarButtonStyle, BranchHeaderStyle_1.selectedHeaderStyle);
        }
        return typestyle_1.classes(BranchHeaderStyle_1.unSelectedHeaderStyle, BranchHeaderStyle_1.openHistorySideBarButtonStyle);
    }
    getBranchHeaderStyle() {
        if (this.props.sideBarExpanded) {
            return typestyle_1.classes(BranchHeaderStyle_1.branchHeaderCenterContent, BranchHeaderStyle_1.unSelectedHeaderStyle);
        }
        return typestyle_1.classes(BranchHeaderStyle_1.selectedHeaderStyle, BranchHeaderStyle_1.branchHeaderCenterContent);
    }
    render() {
        return (React.createElement("div", { className: this.getBranchStyle() },
            React.createElement("div", { style: { display: 'flex' } },
                React.createElement("div", { className: this.getHistoryHeaderStyle(), onClick: this.props.sideBarExpanded
                        ? null
                        : () => this.props.toggleSidebar(), title: 'Show commit history' },
                    React.createElement("h3", { className: BranchHeaderStyle_1.historyLabelStyle }, "History")),
                React.createElement("div", { className: this.getBranchHeaderStyle(), onClick: this.props.sideBarExpanded
                        ? () => this.props.toggleSidebar()
                        : null },
                    React.createElement("h3", { className: BranchHeaderStyle_1.branchLabelStyle }, this.props.currentBranch),
                    React.createElement("div", { className: this.props.disabled
                            ? typestyle_1.classes(BranchHeaderStyle_1.branchDropdownButtonStyle, BranchHeaderStyle_1.headerButtonDisabledStyle)
                            : BranchHeaderStyle_1.branchDropdownButtonStyle, title: 'Change the current branch', onClick: () => this.toggleSelect() }),
                    !this.state.showNewBranchBox && (React.createElement("div", { className: this.props.disabled
                            ? typestyle_1.classes(BranchHeaderStyle_1.newBranchButtonStyle, BranchHeaderStyle_1.headerButtonDisabledStyle)
                            : BranchHeaderStyle_1.newBranchButtonStyle, title: 'Create a new branch', onClick: () => this.toggleNewBranchBox() })),
                    this.state.showNewBranchBox && this.props.showList && (React.createElement(NewBranchBox_1.NewBranchBox, { createNewBranch: this.createNewBranch, toggleNewBranchBox: this.toggleNewBranchBox })),
                    this.props.upstreamBranch != null &&
                        this.props.upstreamBranch !== '' && (React.createElement("div", { className: BranchHeaderStyle_1.branchTrackingIconStyle })),
                    this.props.upstreamBranch != null &&
                        this.props.upstreamBranch !== '' && (React.createElement("h3", { className: BranchHeaderStyle_1.branchTrackingLabelStyle }, this.props.upstreamBranch)))),
            !this.props.sideBarExpanded && (React.createElement(React.Fragment, null,
                this.state.dropdownOpen && (React.createElement("div", null, this.props.data.map((branch, branchIndex) => {
                    return (React.createElement("li", { className: BranchHeaderStyle_1.branchListItemStyle, key: branchIndex, onClick: () => this.switchBranch(branch.name) }, branch.name));
                }))),
                this.state.showNewBranchBox && (React.createElement("div", null,
                    "Branching from ",
                    this.props.currentBranch)),
                this.state.showCommitBox && this.props.showList && (React.createElement(CommitBox_1.CommitBox, { checkReadyForSubmit: this.updateCommitBoxState, stagedFiles: this.props.stagedFiles, commitAllStagedFiles: this.commitAllStagedFiles, topRepoPath: this.props.topRepoPath, refresh: this.props.refresh }))))));
    }
}
exports.BranchHeader = BranchHeader;
