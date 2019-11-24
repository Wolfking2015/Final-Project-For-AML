import { JupyterLab } from '@jupyterlab/application';
import * as React from 'react';
import { ICommitModifiedFile, ISingleCommitInfo, IDiffCallback } from '../git';
export interface ISinglePastCommitInfoProps {
    topRepoPath: string;
    data: ISingleCommitInfo;
    app: JupyterLab;
    diff: IDiffCallback;
    refresh: () => void;
}
export interface ISinglePastCommitInfoState {
    displayDelete: boolean;
    displayReset: boolean;
    info: string;
    filesChanged: string;
    insertionCount: string;
    deletionCount: string;
    modifiedFiles: Array<ICommitModifiedFile>;
    loadingState: 'loading' | 'error' | 'success';
}
export declare class SinglePastCommitInfo extends React.Component<ISinglePastCommitInfoProps, ISinglePastCommitInfoState> {
    constructor(props: ISinglePastCommitInfoProps);
    showPastCommitWork: () => Promise<void>;
    showDeleteCommit: () => void;
    hideDeleteCommit: () => void;
    showResetToCommit: () => void;
    hideResetToCommit: () => void;
    render(): JSX.Element;
}
