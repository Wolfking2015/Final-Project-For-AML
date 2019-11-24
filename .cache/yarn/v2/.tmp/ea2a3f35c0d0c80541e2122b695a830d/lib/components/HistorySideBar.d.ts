import { JupyterLab } from '@jupyterlab/application';
import * as React from 'react';
import { IGitBranchResult, ISingleCommitInfo, IDiffCallback } from '../git';
/** Interface for PastCommits component props */
export interface IHistorySideBarProps {
    pastCommits: ISingleCommitInfo[];
    branches: IGitBranchResult['branches'];
    isExpanded: boolean;
    topRepoPath: string;
    app: JupyterLab;
    refresh: () => void;
    diff: IDiffCallback;
}
export declare class HistorySideBar extends React.Component<IHistorySideBarProps, {}> {
    render(): JSX.Element;
}
