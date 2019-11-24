import { JupyterLab } from '@jupyterlab/application';
import * as React from 'react';
import { IGitBranchResult, ISingleCommitInfo, IDiffCallback } from '../git';
export interface IPastCommitNodeProps {
    pastCommit: ISingleCommitInfo;
    branches: IGitBranchResult['branches'];
    topRepoPath: string;
    app: JupyterLab;
    diff: IDiffCallback;
    refresh: () => void;
}
export interface IPastCommitNodeState {
    expanded: boolean;
}
export declare class PastCommitNode extends React.Component<IPastCommitNodeProps, IPastCommitNodeState> {
    constructor(props: IPastCommitNodeProps);
    getBranchesForCommit(): any[];
    expand(): void;
    collapse(): void;
    getNodeClass(): string;
    render(): JSX.Element;
}
