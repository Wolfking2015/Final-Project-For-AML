import { JupyterLab } from '@jupyterlab/application';
import * as React from 'react';
export interface IGitStageProps {
    heading: string;
    topRepoPath: string;
    files: any;
    app: JupyterLab;
    refresh: any;
    showFiles: boolean;
    displayFiles: Function;
    moveAllFiles: Function;
    discardAllFiles: Function;
    discardFile: Function;
    moveFile: Function;
    moveFileIconClass: string;
    moveFileIconSelectedClass: string;
    moveAllFilesTitle: string;
    moveFileTitle: string;
    openFile: Function;
    extractFilename: Function;
    contextMenu: Function;
    parseFileExtension: Function;
    parseSelectedFileExtension: Function;
    selectedFile: number;
    updateSelectedFile: Function;
    selectedStage: string;
    selectedDiscardFile: number;
    updateSelectedDiscardFile: Function;
    disableFiles: boolean;
    toggleDisableFiles: Function;
    updateSelectedStage: Function;
    isDisabled: boolean;
    disableOthers: Function;
    sideBarExpanded: boolean;
}
export interface IGitStageState {
    showDiscardWarning: boolean;
}
export declare class GitStage extends React.Component<IGitStageProps, IGitStageState> {
    constructor(props: IGitStageProps);
    checkContents(): boolean;
    checkDisabled(): string;
    toggleDiscardChanges(): void;
    /**
     * Callback method discarding all unstanged changes.
     * It shows modal asking for confirmation and when confirmed make
     * server side call to git checkout to discard all unstanged changes.
     */
    discardAllChanges(): Promise<void>;
    render(): JSX.Element;
}
