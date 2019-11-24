import { Spinner } from '@jupyterlab/apputils';
import { Widget } from '@phosphor/widgets';
import { Git } from './git';
export declare enum Operation {
    Pull = "Pull",
    Push = "Push"
}
/**
 * The UI for the content shown within the Git push/pull modal.
 */
export declare class GitPullPushDialog extends Widget {
    spinner: Spinner;
    gitApi: Git;
    body: HTMLElement;
    operation: Operation;
    /**
     * Instantiates the dialog and makes the relevant service API call.
     */
    constructor(currentFileBrowserPath: string, operation: Operation);
    /**
     * Executes the relevant service API depending on the operation and handles response and errors.
     * @param currentFileBrowserPath the path to the current repo
     */
    private executeGitApi;
    /**
     * Handles the response from the server by removing the spinner and showing the appropriate
     * success or error message.
     * @param response the response from the server API call
     */
    private handleResponse;
    private handleError;
    private handleSuccess;
    private createBody;
}
