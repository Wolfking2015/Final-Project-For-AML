import { JupyterLab } from '@jupyterlab/application';
import * as React from 'react';
export interface IFileItemProps {
    topRepoPath: string;
    file: any;
    stage: string;
    app: JupyterLab;
    refresh: any;
    moveFile: Function;
    discardFile: Function;
    moveFileIconClass: string;
    moveFileIconSelectedClass: string;
    moveFileTitle: string;
    openFile: Function;
    extractFilename: Function;
    contextMenu: Function;
    parseFileExtension: Function;
    parseSelectedFileExtension: Function;
    selectedFile: number;
    updateSelectedFile: Function;
    fileIndex: number;
    selectedStage: string;
    selectedDiscardFile: number;
    updateSelectedDiscardFile: Function;
    disableFile: boolean;
    toggleDisableFiles: Function;
    sideBarExpanded: boolean;
}
export declare class FileItem extends React.Component<IFileItemProps, {}> {
    constructor(props: IFileItemProps);
    checkSelected(): boolean;
    getFileChangedLabel(change: string): string;
    showDiscardWarning(): boolean;
    getFileChangedLabelClass(change: string): string;
    getFileLableIconClass(): string;
    getFileClass(): string;
    getFileLabelClass(): string;
    getMoveFileIconClass(): string;
    getDiscardFileIconClass(): string;
    getDiscardWarningClass(): string;
    /**
     * Callback method discarding unstanged changes for selected file.
     * It shows modal asking for confirmation and when confirmed make
     * server side call to git checkout to discard changes in selected file.
     */
    discardSelectedFileChanges(): Promise<void>;
    render(): JSX.Element;
}
