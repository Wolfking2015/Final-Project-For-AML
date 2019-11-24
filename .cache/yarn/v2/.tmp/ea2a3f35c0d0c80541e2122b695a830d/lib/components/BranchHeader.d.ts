import * as React from 'react';
export interface IBranchHeaderState {
    dropdownOpen: boolean;
    showCommitBox: boolean;
    showNewBranchBox: boolean;
}
export interface IBranchHeaderProps {
    currentFileBrowserPath: string;
    topRepoPath: string;
    currentBranch: string;
    upstreamBranch: string;
    stagedFiles: any;
    data: any;
    refresh: any;
    disabled: boolean;
    toggleSidebar: Function;
    showList: boolean;
    sideBarExpanded: boolean;
}
export declare class BranchHeader extends React.Component<IBranchHeaderProps, IBranchHeaderState> {
    interval: any;
    constructor(props: IBranchHeaderProps);
    /** Commit all staged files */
    commitAllStagedFiles: (message: string, path: string) => void;
    /** Update state of commit message input box */
    updateCommitBoxState(disable: boolean, numberOfFiles: number): string;
    /** Switch current working branch */
    switchBranch(branchName: string): Promise<void>;
    createNewBranch: (branchName: string) => Promise<void>;
    toggleSelect(): void;
    getBranchStyle(): string;
    toggleNewBranchBox: () => void;
    getHistoryHeaderStyle(): string;
    getBranchHeaderStyle(): string;
    render(): JSX.Element;
}
