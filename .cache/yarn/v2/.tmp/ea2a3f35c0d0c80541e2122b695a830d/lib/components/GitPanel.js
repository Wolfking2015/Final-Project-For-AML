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
const PathHeader_1 = require("./PathHeader");
const BranchHeader_1 = require("./BranchHeader");
const PastCommits_1 = require("./PastCommits");
const HistorySideBar_1 = require("./HistorySideBar");
const GitPanelStyle_1 = require("../componentsStyle/GitPanelStyle");
/** A React component for the git extension's main display */
class GitPanel extends React.Component {
    constructor(props) {
        super(props);
        this.setShowList = (state) => {
            this.setState({ showList: state });
        };
        /**
         * Refresh widget, update all content
         */
        this.refresh = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let leftSidebarItems = this.props.app.shell.widgets('left');
                let fileBrowser = leftSidebarItems.next();
                while (fileBrowser && fileBrowser.id !== 'filebrowser') {
                    fileBrowser = leftSidebarItems.next();
                }
                let gitApi = new git_1.Git();
                // If fileBrowser has loaded, make API request
                if (fileBrowser) {
                    // Make API call to get all git info for repo
                    let apiResult = yield gitApi.allHistory(fileBrowser.model.path);
                    if (apiResult.code === 0) {
                        // Get top level path of repo
                        let apiShowTopLevel = apiResult.data
                            .show_top_level;
                        // Get current and upstream git branch
                        let branchData = apiResult.data.branch;
                        let currentBranch = 'master';
                        let upstreamBranch = '';
                        if (branchData.code === 0) {
                            let allBranches = branchData.branches;
                            for (let i = 0; i < allBranches.length; i++) {
                                if (allBranches[i].is_current_branch) {
                                    currentBranch = allBranches[i].name;
                                    upstreamBranch = allBranches[i].upstream;
                                    break;
                                }
                            }
                        }
                        // Get git log for current branch
                        let logData = apiResult.data.log;
                        let pastCommits = new Array();
                        if (logData.code === 0) {
                            pastCommits = logData.commits;
                        }
                        // Get git status for current branch
                        let stagedFiles = new Array();
                        let unstagedFiles = new Array();
                        let untrackedFiles = new Array();
                        let changedFiles = 0;
                        let disableSwitchBranch = true;
                        let statusData = apiResult.data.status;
                        if (statusData.code === 0) {
                            let statusFiles = statusData.files;
                            for (let i = 0; i < statusFiles.length; i++) {
                                // If file has been changed
                                if (statusFiles[i].x !== '?' && statusFiles[i].x !== '!') {
                                    changedFiles++;
                                }
                                // If file is untracked
                                if (statusFiles[i].x === '?' && statusFiles[i].y === '?') {
                                    untrackedFiles.push(statusFiles[i]);
                                }
                                else {
                                    // If file is staged
                                    if (statusFiles[i].x !== ' ' && statusFiles[i].y !== 'D') {
                                        stagedFiles.push(statusFiles[i]);
                                    }
                                    // If file is unstaged but tracked
                                    if (statusFiles[i].y !== ' ') {
                                        unstagedFiles.push(statusFiles[i]);
                                    }
                                }
                            }
                            // No uncommitted changed files, allow switching branches
                            if (changedFiles === 0) {
                                disableSwitchBranch = false;
                            }
                        }
                        // No committed files ever, disable switching branches
                        if (pastCommits.length === 0) {
                            disableSwitchBranch = true;
                        }
                        // If not in same repo as before refresh, display the current repo
                        let inNewRepo = this.state.topRepoPath !==
                            apiShowTopLevel.top_repo_path;
                        let showList = this.state.showList;
                        if (inNewRepo) {
                            showList = true;
                        }
                        this.setState({
                            currentFileBrowserPath: fileBrowser.model.path,
                            topRepoPath: apiShowTopLevel
                                .top_repo_path,
                            showWarning: true,
                            branches: branchData.branches,
                            currentBranch: currentBranch,
                            upstreamBranch: upstreamBranch,
                            disableSwitchBranch: disableSwitchBranch,
                            pastCommits: pastCommits,
                            inNewRepo: inNewRepo,
                            showList: showList,
                            stagedFiles: stagedFiles,
                            unstagedFiles: unstagedFiles,
                            untrackedFiles: untrackedFiles
                        });
                    }
                    else {
                        this.setState({
                            currentFileBrowserPath: fileBrowser.model.path,
                            topRepoPath: '',
                            showWarning: false
                        });
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
        });
        this.toggleSidebar = () => {
            this.setState({ sideBarExpanded: !this.state.sideBarExpanded });
        };
        this.state = {
            currentFileBrowserPath: '',
            topRepoPath: '',
            showWarning: false,
            branches: [],
            currentBranch: '',
            upstreamBranch: '',
            disableSwitchBranch: true,
            pastCommits: [],
            inNewRepo: true,
            showList: true,
            stagedFiles: [],
            unstagedFiles: [],
            untrackedFiles: [],
            sideBarExpanded: false
        };
    }
    render() {
        return (React.createElement("div", { className: GitPanelStyle_1.panelContainerStyle },
            React.createElement(PathHeader_1.PathHeader, { currentFileBrowserPath: this.state.currentFileBrowserPath, topRepoPath: this.state.topRepoPath, refresh: this.refresh, currentBranch: this.state.currentBranch }),
            React.createElement("div", null,
                this.state.showWarning && (React.createElement("div", null,
                    React.createElement(BranchHeader_1.BranchHeader, { currentFileBrowserPath: this.state.currentFileBrowserPath, topRepoPath: this.state.topRepoPath, refresh: this.refresh, currentBranch: this.state.currentBranch, upstreamBranch: this.state.upstreamBranch, stagedFiles: this.state.stagedFiles, data: this.state.branches, disabled: this.state.disableSwitchBranch, toggleSidebar: this.toggleSidebar, showList: this.state.showList, sideBarExpanded: this.state.sideBarExpanded }),
                    React.createElement(HistorySideBar_1.HistorySideBar, { isExpanded: this.state.sideBarExpanded, branches: this.state.branches, pastCommits: this.state.pastCommits, topRepoPath: this.state.topRepoPath, app: this.props.app, refresh: this.refresh, diff: this.props.diff }),
                    React.createElement(PastCommits_1.PastCommits, { currentFileBrowserPath: this.state.currentFileBrowserPath, topRepoPath: this.state.topRepoPath, inNewRepo: this.state.inNewRepo, showList: this.state.showList, stagedFiles: this.state.stagedFiles, unstagedFiles: this.state.unstagedFiles, untrackedFiles: this.state.untrackedFiles, app: this.props.app, refresh: this.refresh, diff: this.props.diff, sideBarExpanded: this.state.sideBarExpanded }))),
                !this.state.showWarning && (React.createElement("div", { className: GitPanelStyle_1.panelWarningStyle },
                    React.createElement("div", null, "You aren\u2019t in a git repository."),
                    React.createElement("button", { className: GitPanelStyle_1.findRepoButtonStyle, onClick: () => this.props.app.commands.execute('filebrowser:toggle-main') }, "Go find a repo"))))));
    }
}
exports.GitPanel = GitPanel;
