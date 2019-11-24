import * as React from 'react';
export interface ICommitBoxProps {
    createNewBranch: Function;
    toggleNewBranchBox: Function;
}
export interface ICommitBoxState {
    value: string;
}
export declare class NewBranchBox extends React.Component<ICommitBoxProps, ICommitBoxState> {
    constructor(props: ICommitBoxProps);
    /** Prevent enter key triggered 'submit' action during input */
    onKeyPress(event: any): void;
    /** Handle input inside commit message box */
    handleChange: (event: any) => void;
    render(): JSX.Element;
}
