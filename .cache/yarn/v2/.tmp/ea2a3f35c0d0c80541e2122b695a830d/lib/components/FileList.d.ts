import { JupyterLab } from '@jupyterlab/application';
import * as React from 'react';
export declare namespace CommandIDs {
    const gitFileOpen = "gf:Open";
    const gitFileUnstage = "gf:Unstage";
    const gitFileStage = "gf:Stage";
    const gitFileTrack = "gf:Track";
    const gitFileUntrack = "gf:Untrack";
    const gitFileDiscard = "gf:Discard";
}
export interface IFileListState {
    commitMessage: string;
    disableCommit: boolean;
    showStaged: boolean;
    showUnstaged: boolean;
    showUntracked: boolean;
    contextMenuStaged: any;
    contextMenuUnstaged: any;
    contextMenuUntracked: any;
    contextMenuTypeX: string;
    contextMenuTypeY: string;
    contextMenuFile: string;
    contextMenuIndex: number;
    contextMenuStage: string;
    selectedFile: number;
    selectedStage: string;
    selectedDiscardFile: number;
    disableStaged: boolean;
    disableUnstaged: boolean;
    disableUntracked: boolean;
    disableFiles: boolean;
}
export interface IFileListProps {
    currentFileBrowserPath: string;
    topRepoPath: string;
    stagedFiles: any;
    unstagedFiles: any;
    untrackedFiles: any;
    app: JupyterLab;
    refresh: any;
    sideBarExpanded: boolean;
    display: boolean;
}
export declare class FileList extends React.Component<IFileListProps, IFileListState> {
    constructor(props: IFileListProps);
    /** Handle right-click on a staged file */
    contextMenuStaged: (event: any, typeX: string, typeY: string, file: string, index: number, stage: string) => void;
    /** Handle right-click on an unstaged file */
    contextMenuUnstaged: (event: any, typeX: string, typeY: string, file: string, index: number, stage: string) => void;
    /** Handle right-click on an untracked file */
    contextMenuUntracked: (event: any, typeX: string, typeY: string, file: string, index: number, stage: string) => void;
    /** Toggle display of staged files */
    displayStaged: () => void;
    /** Toggle display of unstaged files */
    displayUnstaged: () => void;
    /** Toggle display of untracked files */
    displayUntracked: () => void;
    updateSelectedStage: (stage: string) => void;
    /** Open a file in the git listing */
    openListedFile(typeX: string, typeY: string, path: string, app: JupyterLab): Promise<void>;
    /** Reset all staged files */
    resetAllStagedFiles(path: string, refresh: Function): void;
    /** Reset a specific staged file */
    resetStagedFile(file: string, path: string, refresh: Function): void;
    /** Add all unstaged files */
    addAllUnstagedFiles(path: string, refresh: Function): void;
    /** Discard changes in all unstaged files */
    discardAllUnstagedFiles(path: string, refresh: Function): void;
    /** Add a specific unstaged file */
    addUnstagedFile(file: string, path: string, refresh: Function): void;
    /** Discard changes in a specific unstaged file */
    discardUnstagedFile(file: string, path: string, refresh: Function): void;
    /** Add all untracked files */
    addAllUntrackedFiles(path: string, refresh: Function): void;
    /** Add a specific untracked file */
    addUntrackedFile(file: string, path: string, refresh: Function): void;
    /** Get the filename from a path */
    extractFilename(path: string): string;
    disableStagesForDiscardAll: () => void;
    updateSelectedDiscardFile: (index: number) => void;
    toggleDisableFiles: () => void;
    updateSelectedFile: (file: number, stage: string) => void;
    render(): JSX.Element;
}
/** Get the extension of a given file */
export declare function parseFileExtension(path: string): string;
/** Get the extension of a given selected file */
export declare function parseSelectedFileExtension(path: string): string;
