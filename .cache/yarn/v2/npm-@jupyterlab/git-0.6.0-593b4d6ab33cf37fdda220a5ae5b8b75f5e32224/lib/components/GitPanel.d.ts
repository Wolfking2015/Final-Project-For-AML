import * as React from 'react';
import { JupyterLab } from '@jupyterlab/application';
import { IDiffCallback } from '../git';
/** Interface for GitPanel component state */
export interface IGitSessionNodeState {
    currentFileBrowserPath: string;
    topRepoPath: string;
    showWarning: boolean;
    branches: any;
    currentBranch: string;
    upstreamBranch: string;
    disableSwitchBranch: boolean;
    pastCommits: any;
    inNewRepo: boolean;
    showList: boolean;
    stagedFiles: any;
    unstagedFiles: any;
    untrackedFiles: any;
    sideBarExpanded: boolean;
}
/** Interface for GitPanel component props */
export interface IGitSessionNodeProps {
    app: JupyterLab;
    diff: IDiffCallback;
}
/** A React component for the git extension's main display */
export declare class GitPanel extends React.Component<IGitSessionNodeProps, IGitSessionNodeState> {
    constructor(props: IGitSessionNodeProps);
    setShowList: (state: boolean) => void;
    /**
     * Refresh widget, update all content
     */
    refresh: () => Promise<void>;
    toggleSidebar: () => void;
    render(): JSX.Element;
}
