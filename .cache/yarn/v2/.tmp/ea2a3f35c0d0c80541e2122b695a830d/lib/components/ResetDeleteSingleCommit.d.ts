import * as React from 'react';
export interface IResetDeleteProps {
    action: 'reset' | 'delete';
    commitId: string;
    path: string;
    onCancel: Function;
    refresh: Function;
}
export interface IResetDeleteState {
    message: string;
    resetDeleteDisabled: boolean;
}
export declare class ResetDeleteSingleCommit extends React.Component<IResetDeleteProps, IResetDeleteState> {
    constructor(props: IResetDeleteProps);
    onCancel: () => void;
    updateMessage: (value: string) => void;
    handleResetDelete: () => void;
    render(): JSX.Element;
}
