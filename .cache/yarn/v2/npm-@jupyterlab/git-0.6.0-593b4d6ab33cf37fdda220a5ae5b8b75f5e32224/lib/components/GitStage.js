"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GitStageStyle_1 = require("../componentsStyle/GitStageStyle");
const FileItem_1 = require("./FileItem");
const typestyle_1 = require("typestyle");
const React = require("react");
const apputils_1 = require("@jupyterlab/apputils");
class GitStage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDiscardWarning: false
        };
    }
    checkContents() {
        if (this.props.files.length > 0) {
            return false;
        }
        else {
            return true;
        }
    }
    checkDisabled() {
        return this.props.isDisabled
            ? typestyle_1.classes(GitStageStyle_1.sectionFileContainerStyle, GitStageStyle_1.sectionFileContainerDisabledStyle)
            : GitStageStyle_1.sectionFileContainerStyle;
    }
    toggleDiscardChanges() {
        this.setState({ showDiscardWarning: !this.state.showDiscardWarning }, () => this.props.disableOthers());
    }
    /**
     * Callback method discarding all unstanged changes.
     * It shows modal asking for confirmation and when confirmed make
     * server side call to git checkout to discard all unstanged changes.
     */
    discardAllChanges() {
        this.toggleDiscardChanges();
        return apputils_1.showDialog({
            title: 'Discard all changes',
            body: `Are you sure you want to permanently discard changes to all files? This action cannot be undone.`,
            buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton({ label: 'Discard' })]
        }).then(result => {
            if (result.button.accept) {
                this.props.discardAllFiles(this.props.topRepoPath, this.props.refresh);
            }
            this.toggleDiscardChanges();
        });
    }
    render() {
        return (React.createElement("div", { className: this.checkDisabled() },
            React.createElement("div", { className: GitStageStyle_1.sectionAreaStyle },
                React.createElement("span", { className: GitStageStyle_1.sectionHeaderLabelStyle },
                    this.props.heading,
                    "(",
                    this.props.files.length,
                    ")"),
                this.props.files.length > 0 && (React.createElement("button", { className: this.props.showFiles
                        ? `${GitStageStyle_1.changeStageButtonStyle} ${GitStageStyle_1.caretdownImageStyle}`
                        : `${GitStageStyle_1.changeStageButtonStyle} ${GitStageStyle_1.caretrightImageStyle}`, onClick: () => this.props.displayFiles() })),
                React.createElement("button", { disabled: this.checkContents(), className: `${this.props.moveFileIconClass} ${GitStageStyle_1.changeStageButtonStyle}
               ${GitStageStyle_1.changeStageButtonLeftStyle}`, title: this.props.moveAllFilesTitle, onClick: () => this.props.moveAllFiles(this.props.topRepoPath, this.props.refresh) }),
                this.props.heading === 'Changed' && (React.createElement("button", { disabled: this.checkContents(), className: typestyle_1.classes(GitStageStyle_1.changeStageButtonStyle, GitStageStyle_1.discardFileButtonStyle), title: 'Discard All Changes', onClick: () => this.discardAllChanges() }))),
            this.props.showFiles && (React.createElement("div", { className: GitStageStyle_1.sectionFileContainerStyle }, this.props.files.map((file, fileIndex) => {
                return (React.createElement(FileItem_1.FileItem, { key: fileIndex, topRepoPath: this.props.topRepoPath, stage: this.props.heading, file: file, app: this.props.app, refresh: this.props.refresh, moveFile: this.props.moveFile, discardFile: this.props.discardFile, moveFileIconClass: this.props.moveFileIconClass, moveFileIconSelectedClass: this.props.moveFileIconSelectedClass, moveFileTitle: this.props.moveFileTitle, openFile: this.props.openFile, extractFilename: this.props.extractFilename, contextMenu: this.props.contextMenu, parseFileExtension: this.props.parseFileExtension, parseSelectedFileExtension: this.props.parseSelectedFileExtension, selectedFile: this.props.selectedFile, updateSelectedFile: this.props.updateSelectedFile, fileIndex: fileIndex, selectedStage: this.props.selectedStage, selectedDiscardFile: this.props.selectedDiscardFile, updateSelectedDiscardFile: this.props.updateSelectedDiscardFile, disableFile: this.props.disableFiles, toggleDisableFiles: this.props.toggleDisableFiles, sideBarExpanded: this.props.sideBarExpanded }));
            })))));
    }
}
exports.GitStage = GitStage;
