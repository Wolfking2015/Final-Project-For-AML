import * as React from 'react';
export interface ICommitBoxProps {
    checkReadyForSubmit: Function;
    stagedFiles: any;
    commitAllStagedFiles: Function;
    topRepoPath: string;
    refresh: Function;
}
export interface ICommitBoxState {
    value: string;
    disableSubmit: boolean;
}
export declare class CommitBox extends React.Component<ICommitBoxProps, ICommitBoxState> {
    constructor(props: ICommitBoxProps);
    /** Prevent enter key triggered 'submit' action during commit message input */
    onKeyPress(event: any): void;
    /** Initalize commit message input box */
    initializeInput: () => void;
    /** Handle input inside commit message box */
    handleChange: (event: any) => void;
    render(): JSX.Element;
}
