import * as React from 'react';
import { Git } from '../git';
export interface IPathHeaderState {
    refresh: any;
    gitApi: Git;
}
export interface IPathHeaderProps {
    currentFileBrowserPath: string;
    topRepoPath: string;
    refresh: any;
    currentBranch: string;
}
export declare class PathHeader extends React.Component<IPathHeaderProps, IPathHeaderState> {
    constructor(props: IPathHeaderProps);
    render(): JSX.Element;
    /**
     * Displays the error dialog when the Git Push/Pull operation fails.
     * @param title the title of the error dialog
     * @param body the message to be shown in the body of the modal.
     */
    private showGitPushPullDialog;
}
