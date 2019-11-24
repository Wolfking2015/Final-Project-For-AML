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
const apputils_1 = require("@jupyterlab/apputils");
const widgets_1 = require("@phosphor/widgets");
const coreutils_1 = require("@jupyterlab/coreutils");
const git_1 = require("../git");
const FileListStyle_1 = require("../componentsStyle/FileListStyle");
const GitStage_1 = require("./GitStage");
const React = require("react");
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.gitFileOpen = 'gf:Open';
    CommandIDs.gitFileUnstage = 'gf:Unstage';
    CommandIDs.gitFileStage = 'gf:Stage';
    CommandIDs.gitFileTrack = 'gf:Track';
    CommandIDs.gitFileUntrack = 'gf:Untrack';
    CommandIDs.gitFileDiscard = 'gf:Discard';
})(CommandIDs = exports.CommandIDs || (exports.CommandIDs = {}));
class FileList extends React.Component {
    constructor(props) {
        super(props);
        /** Handle right-click on a staged file */
        this.contextMenuStaged = (event, typeX, typeY, file, index, stage) => {
            event.persist();
            event.preventDefault();
            this.setState({
                contextMenuTypeX: typeX,
                contextMenuTypeY: typeY,
                contextMenuFile: file,
                contextMenuIndex: index,
                contextMenuStage: stage
            }, () => this.state.contextMenuStaged.open(event.clientX, event.clientY));
        };
        /** Handle right-click on an unstaged file */
        this.contextMenuUnstaged = (event, typeX, typeY, file, index, stage) => {
            event.persist();
            event.preventDefault();
            this.setState({
                contextMenuTypeX: typeX,
                contextMenuTypeY: typeY,
                contextMenuFile: file,
                contextMenuIndex: index,
                contextMenuStage: stage
            }, () => this.state.contextMenuUnstaged.open(event.clientX, event.clientY));
        };
        /** Handle right-click on an untracked file */
        this.contextMenuUntracked = (event, typeX, typeY, file, index, stage) => {
            event.persist();
            event.preventDefault();
            this.setState({
                contextMenuTypeX: typeX,
                contextMenuTypeY: typeY,
                contextMenuFile: file,
                contextMenuIndex: index,
                contextMenuStage: stage
            }, () => this.state.contextMenuUntracked.open(event.clientX, event.clientY));
        };
        /** Toggle display of staged files */
        this.displayStaged = () => {
            this.setState({ showStaged: !this.state.showStaged });
        };
        /** Toggle display of unstaged files */
        this.displayUnstaged = () => {
            this.setState({ showUnstaged: !this.state.showUnstaged });
        };
        /** Toggle display of untracked files */
        this.displayUntracked = () => {
            this.setState({ showUntracked: !this.state.showUntracked });
        };
        this.updateSelectedStage = (stage) => {
            this.setState({ selectedStage: stage });
        };
        this.disableStagesForDiscardAll = () => {
            this.setState({
                disableStaged: !this.state.disableStaged,
                disableUntracked: !this.state.disableUntracked
            });
        };
        this.updateSelectedDiscardFile = (index) => {
            this.setState({ selectedDiscardFile: index });
        };
        this.toggleDisableFiles = () => {
            this.setState({ disableFiles: !this.state.disableFiles });
        };
        this.updateSelectedFile = (file, stage) => {
            this.setState({ selectedFile: file }, () => this.updateSelectedStage(stage));
        };
        const { commands } = this.props.app;
        this.state = {
            commitMessage: '',
            disableCommit: true,
            showStaged: true,
            showUnstaged: true,
            showUntracked: true,
            contextMenuStaged: new widgets_1.Menu({ commands }),
            contextMenuUnstaged: new widgets_1.Menu({ commands }),
            contextMenuUntracked: new widgets_1.Menu({ commands }),
            contextMenuTypeX: '',
            contextMenuTypeY: '',
            contextMenuFile: '',
            contextMenuIndex: -1,
            contextMenuStage: '',
            selectedFile: -1,
            selectedStage: '',
            selectedDiscardFile: -1,
            disableStaged: false,
            disableUnstaged: false,
            disableUntracked: false,
            disableFiles: false
        };
        /** Add right-click menu options for files in repo
         *
         */
        if (!commands.hasCommand(CommandIDs.gitFileOpen)) {
            commands.addCommand(CommandIDs.gitFileOpen, {
                label: 'Open',
                caption: 'Open selected file',
                execute: () => {
                    try {
                        this.openListedFile(this.state.contextMenuTypeX, this.state.contextMenuTypeY, this.state.contextMenuFile, this.props.app);
                    }
                    catch (err) { }
                }
            });
        }
        if (!commands.hasCommand(CommandIDs.gitFileStage)) {
            commands.addCommand(CommandIDs.gitFileStage, {
                label: 'Stage',
                caption: 'Stage the changes of selected file',
                execute: () => {
                    try {
                        this.addUnstagedFile(this.state.contextMenuFile, this.props.topRepoPath, this.props.refresh);
                    }
                    catch (err) { }
                }
            });
        }
        if (!commands.hasCommand(CommandIDs.gitFileTrack)) {
            commands.addCommand(CommandIDs.gitFileTrack, {
                label: 'Track',
                caption: 'Start tracking selected file',
                execute: () => {
                    try {
                        this.addUntrackedFile(this.state.contextMenuFile, this.props.topRepoPath, this.props.refresh);
                    }
                    catch (err) { }
                }
            });
        }
        if (!commands.hasCommand(CommandIDs.gitFileUnstage)) {
            commands.addCommand(CommandIDs.gitFileUnstage, {
                label: 'Unstage',
                caption: 'Unstage the changes of selected file',
                execute: () => {
                    try {
                        if (this.state.contextMenuTypeX !== 'D') {
                            this.resetStagedFile(this.state.contextMenuFile, this.props.topRepoPath, this.props.refresh);
                        }
                    }
                    catch (err) { }
                }
            });
        }
        if (!commands.hasCommand(CommandIDs.gitFileDiscard)) {
            commands.addCommand(CommandIDs.gitFileDiscard, {
                label: 'Discard',
                caption: 'Discard recent changes of selected file',
                execute: () => {
                    try {
                        this.updateSelectedFile(this.state.contextMenuIndex, this.state.contextMenuStage);
                        this.updateSelectedDiscardFile(this.state.contextMenuIndex);
                        this.toggleDisableFiles();
                    }
                    catch (err) { }
                }
            });
        }
        this.state.contextMenuStaged.addItem({ command: CommandIDs.gitFileOpen });
        this.state.contextMenuStaged.addItem({
            command: CommandIDs.gitFileUnstage
        });
        this.state.contextMenuUnstaged.addItem({ command: CommandIDs.gitFileOpen });
        this.state.contextMenuUnstaged.addItem({
            command: CommandIDs.gitFileStage
        });
        this.state.contextMenuUnstaged.addItem({
            command: CommandIDs.gitFileDiscard
        });
        this.state.contextMenuUntracked.addItem({
            command: CommandIDs.gitFileOpen
        });
        this.state.contextMenuUntracked.addItem({
            command: CommandIDs.gitFileTrack
        });
    }
    /** Open a file in the git listing */
    openListedFile(typeX, typeY, path, app) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeX === 'D' || typeY === 'D') {
                apputils_1.showDialog({
                    title: 'Open File Failed',
                    body: 'This file has been deleted!',
                    buttons: [apputils_1.Dialog.warnButton({ label: 'OK' })]
                }).then(result => {
                    if (result.button.accept) {
                        return;
                    }
                });
                return;
            }
            try {
                const leftSidebarItems = app.shell.widgets('left');
                let fileBrowser = leftSidebarItems.next();
                while (fileBrowser.id !== 'filebrowser') {
                    fileBrowser = leftSidebarItems.next();
                }
                let gitApi = new git_1.Git();
                let prefixData = yield gitApi.showPrefix(fileBrowser.model.path);
                let underRepoPath = prefixData.under_repo_path;
                let fileBrowserPath = fileBrowser.model.path + '/';
                let openFilePath = fileBrowserPath.substring(0, fileBrowserPath.length - underRepoPath.length);
                if (path[path.length - 1] !== '/') {
                    fileBrowser._listing._manager.openOrReveal(openFilePath + path);
                }
                else {
                    console.log('Cannot open a folder here');
                }
            }
            catch (err) { }
        });
    }
    /** Reset all staged files */
    resetAllStagedFiles(path, refresh) {
        let gitApi = new git_1.Git();
        gitApi.reset(true, null, path).then(response => {
            refresh();
        });
    }
    /** Reset a specific staged file */
    resetStagedFile(file, path, refresh) {
        let gitApi = new git_1.Git();
        gitApi.reset(false, file, path).then(response => {
            refresh();
        });
    }
    /** Add all unstaged files */
    addAllUnstagedFiles(path, refresh) {
        let gitApi = new git_1.Git();
        gitApi.add(true, null, path).then(response => {
            refresh();
        });
    }
    /** Discard changes in all unstaged files */
    discardAllUnstagedFiles(path, refresh) {
        let gitApi = new git_1.Git();
        gitApi
            .checkout(false, false, null, true, null, path)
            .then(response => {
            refresh();
        })
            .catch(() => {
            apputils_1.showDialog({
                title: 'Discard all changes failed.',
                buttons: [apputils_1.Dialog.warnButton({ label: 'DISMISS' })]
            }).then(() => {
                /** no-op */
            });
        });
    }
    /** Add a specific unstaged file */
    addUnstagedFile(file, path, refresh) {
        let gitApi = new git_1.Git();
        gitApi.add(false, file, path).then(response => {
            refresh();
        });
    }
    /** Discard changes in a specific unstaged file */
    discardUnstagedFile(file, path, refresh) {
        let gitApi = new git_1.Git();
        gitApi
            .checkout(false, false, null, false, file, path)
            .then(response => {
            refresh();
        })
            .catch(() => {
            apputils_1.showDialog({
                title: `Discard changes for ${file} failed.`,
                buttons: [apputils_1.Dialog.warnButton({ label: 'DISMISS' })]
            }).then(() => {
                /** no-op */
            });
        });
    }
    /** Add all untracked files */
    addAllUntrackedFiles(path, refresh) {
        let gitApi = new git_1.Git();
        gitApi.addAllUntracked(path).then(response => {
            refresh();
        });
    }
    /** Add a specific untracked file */
    addUntrackedFile(file, path, refresh) {
        let gitApi = new git_1.Git();
        gitApi.add(false, file, path).then(response => {
            refresh();
        });
    }
    /** Get the filename from a path */
    extractFilename(path) {
        if (path[path.length - 1] === '/') {
            return path;
        }
        else {
            let temp = path.split('/');
            return temp[temp.length - 1];
        }
    }
    render() {
        return (React.createElement("div", { onContextMenu: event => event.preventDefault() }, this.props.display && (React.createElement("div", null,
            React.createElement(GitStage_1.GitStage, { heading: 'Staged', topRepoPath: this.props.topRepoPath, files: this.props.stagedFiles, app: this.props.app, refresh: this.props.refresh, showFiles: this.state.showStaged, displayFiles: this.displayStaged, moveAllFiles: this.resetAllStagedFiles, discardAllFiles: null, discardFile: null, moveFile: this.resetStagedFile, moveFileIconClass: FileListStyle_1.moveFileDownButtonStyle, moveFileIconSelectedClass: FileListStyle_1.moveFileDownButtonSelectedStyle, moveAllFilesTitle: 'Unstage all changes', moveFileTitle: 'Unstage this change', openFile: this.openListedFile, extractFilename: this.extractFilename, contextMenu: this.contextMenuStaged, parseFileExtension: parseFileExtension, parseSelectedFileExtension: parseSelectedFileExtension, selectedFile: this.state.selectedFile, updateSelectedFile: this.updateSelectedFile, selectedStage: this.state.selectedStage, updateSelectedStage: this.updateSelectedStage, selectedDiscardFile: this.state.selectedDiscardFile, updateSelectedDiscardFile: this.updateSelectedDiscardFile, disableFiles: this.state.disableFiles, toggleDisableFiles: this.toggleDisableFiles, disableOthers: null, isDisabled: this.state.disableStaged, sideBarExpanded: this.props.sideBarExpanded }),
            React.createElement(GitStage_1.GitStage, { heading: 'Changed', topRepoPath: this.props.topRepoPath, files: this.props.unstagedFiles, app: this.props.app, refresh: this.props.refresh, showFiles: this.state.showUnstaged, displayFiles: this.displayUnstaged, moveAllFiles: this.addAllUnstagedFiles, discardAllFiles: this.discardAllUnstagedFiles, discardFile: this.discardUnstagedFile, moveFile: this.addUnstagedFile, moveFileIconClass: FileListStyle_1.moveFileUpButtonStyle, moveFileIconSelectedClass: FileListStyle_1.moveFileUpButtonSelectedStyle, moveAllFilesTitle: 'Stage all changes', moveFileTitle: 'Stage this change', openFile: this.openListedFile, extractFilename: this.extractFilename, contextMenu: this.contextMenuUnstaged, parseFileExtension: parseFileExtension, parseSelectedFileExtension: parseSelectedFileExtension, selectedFile: this.state.selectedFile, updateSelectedFile: this.updateSelectedFile, selectedStage: this.state.selectedStage, updateSelectedStage: this.updateSelectedStage, selectedDiscardFile: this.state.selectedDiscardFile, updateSelectedDiscardFile: this.updateSelectedDiscardFile, disableFiles: this.state.disableFiles, toggleDisableFiles: this.toggleDisableFiles, disableOthers: this.disableStagesForDiscardAll, isDisabled: this.state.disableUnstaged, sideBarExpanded: this.props.sideBarExpanded }),
            React.createElement(GitStage_1.GitStage, { heading: 'Untracked', topRepoPath: this.props.topRepoPath, files: this.props.untrackedFiles, app: this.props.app, refresh: this.props.refresh, showFiles: this.state.showUntracked, displayFiles: this.displayUntracked, moveAllFiles: this.addAllUntrackedFiles, discardAllFiles: null, discardFile: null, moveFile: this.addUntrackedFile, moveFileIconClass: FileListStyle_1.moveFileUpButtonStyle, moveFileIconSelectedClass: FileListStyle_1.moveFileUpButtonSelectedStyle, moveAllFilesTitle: 'Track all untracked files', moveFileTitle: 'Track this file', openFile: this.openListedFile, extractFilename: this.extractFilename, contextMenu: this.contextMenuUntracked, parseFileExtension: parseFileExtension, parseSelectedFileExtension: parseSelectedFileExtension, selectedFile: this.state.selectedFile, updateSelectedFile: this.updateSelectedFile, selectedStage: this.state.selectedStage, updateSelectedStage: this.updateSelectedStage, selectedDiscardFile: this.state.selectedDiscardFile, updateSelectedDiscardFile: this.updateSelectedDiscardFile, disableFiles: this.state.disableFiles, toggleDisableFiles: this.toggleDisableFiles, disableOthers: null, isDisabled: this.state.disableUntracked, sideBarExpanded: this.props.sideBarExpanded })))));
    }
}
exports.FileList = FileList;
/** Get the extension of a given file */
function parseFileExtension(path) {
    if (path[path.length - 1] === '/') {
        return FileListStyle_1.folderFileIconStyle;
    }
    let fileExtension = coreutils_1.PathExt.extname(path).toLocaleLowerCase();
    switch (fileExtension) {
        case '.md':
            return FileListStyle_1.markdownFileIconStyle;
        case '.py':
            return FileListStyle_1.pythonFileIconStyle;
        case '.json':
            return FileListStyle_1.jsonFileIconStyle;
        case '.csv':
            return FileListStyle_1.spreadsheetFileIconStyle;
        case '.xls':
            return FileListStyle_1.spreadsheetFileIconStyle;
        case '.r':
            return FileListStyle_1.kernelFileIconStyle;
        case '.yml':
            return FileListStyle_1.yamlFileIconStyle;
        case '.yaml':
            return FileListStyle_1.yamlFileIconStyle;
        case '.svg':
            return FileListStyle_1.imageFileIconStyle;
        case '.tiff':
            return FileListStyle_1.imageFileIconStyle;
        case '.jpeg':
            return FileListStyle_1.imageFileIconStyle;
        case '.jpg':
            return FileListStyle_1.imageFileIconStyle;
        case '.gif':
            return FileListStyle_1.imageFileIconStyle;
        case '.png':
            return FileListStyle_1.imageFileIconStyle;
        case '.raw':
            return FileListStyle_1.imageFileIconStyle;
        default:
            return FileListStyle_1.genericFileIconStyle;
    }
}
exports.parseFileExtension = parseFileExtension;
/** Get the extension of a given selected file */
function parseSelectedFileExtension(path) {
    if (path[path.length - 1] === '/') {
        return FileListStyle_1.folderFileIconSelectedStyle;
    }
    let fileExtension = coreutils_1.PathExt.extname(path).toLocaleLowerCase();
    switch (fileExtension) {
        case '.md':
            return FileListStyle_1.markdownFileIconSelectedStyle;
        case '.py':
            return FileListStyle_1.pythonFileIconSelectedStyle;
        case '.json':
            return FileListStyle_1.jsonFileIconSelectedStyle;
        case '.csv':
            return FileListStyle_1.spreadsheetFileIconSelectedStyle;
        case '.xls':
            return FileListStyle_1.spreadsheetFileIconSelectedStyle;
        case '.r':
            return FileListStyle_1.kernelFileIconSelectedStyle;
        case '.yml':
            return FileListStyle_1.yamlFileIconSelectedStyle;
        case '.yaml':
            return FileListStyle_1.yamlFileIconSelectedStyle;
        case '.svg':
            return FileListStyle_1.imageFileIconSelectedStyle;
        case '.tiff':
            return FileListStyle_1.imageFileIconSelectedStyle;
        case '.jpeg':
            return FileListStyle_1.imageFileIconSelectedStyle;
        case '.jpg':
            return FileListStyle_1.imageFileIconSelectedStyle;
        case '.gif':
            return FileListStyle_1.imageFileIconSelectedStyle;
        case '.png':
            return FileListStyle_1.imageFileIconSelectedStyle;
        case '.raw':
            return FileListStyle_1.imageFileIconSelectedStyle;
        default:
            return FileListStyle_1.genericFileIconSelectedStyle;
    }
}
exports.parseSelectedFileExtension = parseSelectedFileExtension;
