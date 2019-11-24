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
const typestyle_1 = require("typestyle/");
const FileItemStyle_1 = require("../componentsStyle/FileItemStyle");
const GitStageStyle_1 = require("../componentsStyle/GitStageStyle");
const SinglePastCommitInfoStyle_1 = require("../componentsStyle/SinglePastCommitInfoStyle");
const git_1 = require("../git");
const FileList_1 = require("./FileList");
const ResetDeleteSingleCommit_1 = require("./ResetDeleteSingleCommit");
class SinglePastCommitInfo extends React.Component {
    constructor(props) {
        super(props);
        this.showPastCommitWork = () => __awaiter(this, void 0, void 0, function* () {
            let gitApi = new git_1.Git();
            let detailedLogData;
            try {
                detailedLogData = yield gitApi.detailedLog(this.props.data.commit, this.props.topRepoPath);
            }
            catch (err) {
                console.error(`Error while gettting detailed log for commit ${this.props.data.commit} and path ${this.props.topRepoPath}`, err);
                this.setState(() => ({ loadingState: 'error' }));
                return;
            }
            if (detailedLogData.code === 0) {
                this.setState({
                    info: detailedLogData.modified_file_note,
                    filesChanged: detailedLogData.modified_files_count,
                    insertionCount: detailedLogData.number_of_insertions,
                    deletionCount: detailedLogData.number_of_deletions,
                    modifiedFiles: detailedLogData.modified_files,
                    loadingState: 'success'
                });
            }
        });
        this.showDeleteCommit = () => {
            this.setState({
                displayDelete: true,
                displayReset: false
            });
        };
        this.hideDeleteCommit = () => {
            this.setState({
                displayDelete: false
            });
        };
        this.showResetToCommit = () => {
            this.setState({
                displayReset: true,
                displayDelete: false
            });
        };
        this.hideResetToCommit = () => {
            this.setState({
                displayReset: false
            });
        };
        this.state = {
            displayDelete: false,
            displayReset: false,
            info: '',
            filesChanged: '',
            insertionCount: '',
            deletionCount: '',
            modifiedFiles: [],
            loadingState: 'loading'
        };
        this.showPastCommitWork();
    }
    render() {
        if (this.state.loadingState === 'loading') {
            return React.createElement("div", null, "...");
        }
        if (this.state.loadingState === 'error') {
            return React.createElement("div", null, "Error loading commit data");
        }
        return (React.createElement("div", null,
            React.createElement("div", { className: SinglePastCommitInfoStyle_1.commitStyle },
                React.createElement("div", { className: SinglePastCommitInfoStyle_1.commitOverviewNumbers },
                    React.createElement("span", null,
                        React.createElement("span", { className: typestyle_1.classes(SinglePastCommitInfoStyle_1.iconStyle, SinglePastCommitInfoStyle_1.numberofChangedFilesStyle) }),
                        this.state.filesChanged),
                    React.createElement("span", null,
                        React.createElement("span", { className: typestyle_1.classes(SinglePastCommitInfoStyle_1.iconStyle, SinglePastCommitInfoStyle_1.insertionIconStyle) }),
                        this.state.insertionCount),
                    React.createElement("span", null,
                        React.createElement("span", { className: typestyle_1.classes(SinglePastCommitInfoStyle_1.iconStyle, SinglePastCommitInfoStyle_1.deletionIconStyle) }),
                        this.state.deletionCount))),
            React.createElement("div", { className: SinglePastCommitInfoStyle_1.commitDetailStyle },
                React.createElement("div", { className: SinglePastCommitInfoStyle_1.commitDetailHeader },
                    "Changed",
                    React.createElement("button", { className: typestyle_1.classes(GitStageStyle_1.changeStageButtonStyle, SinglePastCommitInfoStyle_1.floatRightStyle, GitStageStyle_1.discardFileButtonStyle), onClick: this.showDeleteCommit }),
                    React.createElement("button", { className: typestyle_1.classes(GitStageStyle_1.changeStageButtonStyle, SinglePastCommitInfoStyle_1.floatRightStyle, SinglePastCommitInfoStyle_1.revertButtonStyle), onClick: this.showResetToCommit })),
                React.createElement("div", null,
                    this.state.displayDelete && (React.createElement(ResetDeleteSingleCommit_1.ResetDeleteSingleCommit, { action: "delete", commitId: this.props.data.commit, path: this.props.topRepoPath, onCancel: this.hideDeleteCommit, refresh: this.props.refresh })),
                    this.state.displayReset && (React.createElement(ResetDeleteSingleCommit_1.ResetDeleteSingleCommit, { action: "reset", commitId: this.props.data.commit, path: this.props.topRepoPath, onCancel: this.hideResetToCommit, refresh: this.props.refresh }))),
                this.state.modifiedFiles.length > 0 &&
                    this.state.modifiedFiles.map((modifiedFile, modifiedFileIndex) => {
                        return (React.createElement("li", { className: SinglePastCommitInfoStyle_1.commitDetailFileStyle, key: modifiedFileIndex },
                            React.createElement("span", { className: `${FileItemStyle_1.fileIconStyle} ${FileList_1.parseFileExtension(modifiedFile.modified_file_path)}`, onDoubleClick: () => {
                                    window.open('https://github.com/search?q=' +
                                        this.props.data.commit +
                                        '&type=Commits&utf8=%E2%9C%93');
                                } }),
                            React.createElement("span", { className: SinglePastCommitInfoStyle_1.commitDetailFilePathStyle, onDoubleClick: () => {
                                    this.props.diff(modifiedFile.modified_file_path, this.props.data.commit, this.props.data.pre_commit);
                                } }, modifiedFile.modified_file_name)));
                    }))));
    }
}
exports.SinglePastCommitInfo = SinglePastCommitInfo;
