"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GitStageStyle_1 = require("../componentsStyle/GitStageStyle");
const FileItemStyle_1 = require("../componentsStyle/FileItemStyle");
const typestyle_1 = require("typestyle");
const React = require("react");
const apputils_1 = require("@jupyterlab/apputils");
class FileItem extends React.Component {
    constructor(props) {
        super(props);
    }
    checkSelected() {
        return (this.props.selectedFile === this.props.fileIndex &&
            this.props.selectedStage === this.props.stage);
    }
    getFileChangedLabel(change) {
        if (change === 'M') {
            return 'Mod';
        }
        else if (change === 'A') {
            return 'Add';
        }
        else if (change === 'D') {
            return 'Rmv';
        }
        else if (change === 'R') {
            return 'Rnm';
        }
    }
    showDiscardWarning() {
        return (this.props.selectedDiscardFile === this.props.fileIndex &&
            this.props.stage === 'Changed');
    }
    getFileChangedLabelClass(change) {
        if (change === 'M') {
            if (this.showDiscardWarning()) {
                return typestyle_1.classes(FileItemStyle_1.fileChangedLabelStyle, FileItemStyle_1.fileChangedLabelBrandStyle);
            }
            else {
                return this.checkSelected()
                    ? typestyle_1.classes(FileItemStyle_1.fileChangedLabelStyle, FileItemStyle_1.fileChangedLabelBrandStyle, FileItemStyle_1.selectedFileChangedLabelStyle)
                    : typestyle_1.classes(FileItemStyle_1.fileChangedLabelStyle, FileItemStyle_1.fileChangedLabelBrandStyle);
            }
        }
        else {
            if (this.showDiscardWarning()) {
                return typestyle_1.classes(FileItemStyle_1.fileChangedLabelStyle, FileItemStyle_1.fileChangedLabelInfoStyle);
            }
            else {
                return this.checkSelected()
                    ? typestyle_1.classes(FileItemStyle_1.fileChangedLabelStyle, FileItemStyle_1.fileChangedLabelInfoStyle, FileItemStyle_1.selectedFileChangedLabelStyle)
                    : typestyle_1.classes(FileItemStyle_1.fileChangedLabelStyle, FileItemStyle_1.fileChangedLabelInfoStyle);
            }
        }
    }
    getFileLableIconClass() {
        if (this.showDiscardWarning()) {
            return typestyle_1.classes(FileItemStyle_1.fileIconStyle, this.props.parseFileExtension(this.props.file.to));
        }
        else {
            return this.checkSelected()
                ? typestyle_1.classes(FileItemStyle_1.fileIconStyle, this.props.parseSelectedFileExtension(this.props.file.to))
                : typestyle_1.classes(FileItemStyle_1.fileIconStyle, this.props.parseFileExtension(this.props.file.to));
        }
    }
    getFileClass() {
        if (!this.checkSelected() && this.props.disableFile) {
            return typestyle_1.classes(FileItemStyle_1.fileStyle, FileItemStyle_1.disabledFileStyle);
        }
        else if (this.showDiscardWarning()) {
            typestyle_1.classes(FileItemStyle_1.fileStyle, FileItemStyle_1.expandedFileStyle);
        }
        else {
            return this.checkSelected()
                ? typestyle_1.classes(FileItemStyle_1.fileStyle, FileItemStyle_1.selectedFileStyle)
                : typestyle_1.classes(FileItemStyle_1.fileStyle);
        }
    }
    getFileLabelClass() {
        return this.props.sideBarExpanded
            ? typestyle_1.classes(FileItemStyle_1.fileLabelStyle, FileItemStyle_1.sideBarExpandedFileLabelStyle)
            : FileItemStyle_1.fileLabelStyle;
    }
    getMoveFileIconClass() {
        if (this.showDiscardWarning()) {
            return typestyle_1.classes(FileItemStyle_1.fileButtonStyle, GitStageStyle_1.changeStageButtonStyle, GitStageStyle_1.changeStageButtonLeftStyle, FileItemStyle_1.fileGitButtonStyle, this.props.moveFileIconClass);
        }
        else {
            return this.checkSelected()
                ? typestyle_1.classes(FileItemStyle_1.fileButtonStyle, GitStageStyle_1.changeStageButtonStyle, GitStageStyle_1.changeStageButtonLeftStyle, FileItemStyle_1.fileGitButtonStyle, this.props.moveFileIconSelectedClass)
                : typestyle_1.classes(FileItemStyle_1.fileButtonStyle, GitStageStyle_1.changeStageButtonStyle, GitStageStyle_1.changeStageButtonLeftStyle, FileItemStyle_1.fileGitButtonStyle, this.props.moveFileIconClass);
        }
    }
    getDiscardFileIconClass() {
        if (this.showDiscardWarning()) {
            return typestyle_1.classes(FileItemStyle_1.fileButtonStyle, GitStageStyle_1.changeStageButtonStyle, FileItemStyle_1.fileGitButtonStyle, GitStageStyle_1.discardFileButtonStyle);
        }
        else {
            return this.checkSelected()
                ? typestyle_1.classes(FileItemStyle_1.fileButtonStyle, GitStageStyle_1.changeStageButtonStyle, FileItemStyle_1.fileGitButtonStyle, FileItemStyle_1.discardFileButtonSelectedStyle)
                : typestyle_1.classes(FileItemStyle_1.fileButtonStyle, GitStageStyle_1.changeStageButtonStyle, FileItemStyle_1.fileGitButtonStyle, GitStageStyle_1.discardFileButtonStyle);
        }
    }
    getDiscardWarningClass() {
        return FileItemStyle_1.discardWarningStyle;
    }
    /**
     * Callback method discarding unstanged changes for selected file.
     * It shows modal asking for confirmation and when confirmed make
     * server side call to git checkout to discard changes in selected file.
     */
    discardSelectedFileChanges() {
        this.props.toggleDisableFiles();
        this.props.updateSelectedDiscardFile(this.props.fileIndex);
        return apputils_1.showDialog({
            title: 'Discard changes',
            body: `Are you sure you want to permanently discard changes to ${this.props.file.from}? This action cannot be undone.`,
            buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton({ label: 'Discard' })]
        }).then(result => {
            if (result.button.accept) {
                this.props.discardFile(this.props.file.to, this.props.topRepoPath, this.props.refresh);
            }
            this.props.toggleDisableFiles();
            this.props.updateSelectedDiscardFile(-1);
        });
    }
    render() {
        return (React.createElement("div", { className: this.getFileClass(), onClick: () => this.props.updateSelectedFile(this.props.fileIndex, this.props.stage) },
            React.createElement("button", { className: `jp-Git-button ${this.getMoveFileIconClass()}`, title: this.props.moveFileTitle, onClick: () => {
                    this.props.moveFile(this.props.file.to, this.props.topRepoPath, this.props.refresh);
                } }),
            React.createElement("span", { className: this.getFileLableIconClass() }),
            React.createElement("span", { className: this.getFileLabelClass(), onContextMenu: e => {
                    this.props.contextMenu(e, this.props.file.x, this.props.file.y, this.props.file.to, this.props.fileIndex, this.props.stage);
                }, onDoubleClick: () => this.props.openFile(this.props.file.x, this.props.file.y, this.props.file.to, this.props.app), title: this.props.file.to },
                this.props.extractFilename(this.props.file.to),
                React.createElement("span", { className: this.getFileChangedLabelClass(this.props.file.y) }, this.getFileChangedLabel(this.props.file.y)),
                this.props.stage === 'Changed' && (React.createElement("button", { className: `jp-Git-button ${this.getDiscardFileIconClass()}`, title: 'Discard this change', onClick: () => {
                        this.discardSelectedFileChanges();
                    } })))));
    }
}
exports.FileItem = FileItem;
