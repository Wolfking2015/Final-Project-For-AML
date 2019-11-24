import { ToolbarButton } from '@jupyterlab/apputils';
import { Widget } from '@phosphor/widgets';
import { FileBrowser, IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { Git } from './git';
/**
 * The widget encapsulating the Git Clone UI:
 * 1. Includes the Git Clone button in the File Browser toolbar.
 * 2. Includes the modal (UI + callbacks) which invoked to enable Git Clone functionality.
 */
export declare class GitClone extends Widget {
    fileBrowser: FileBrowser;
    gitApi: Git;
    enabledCloneButton: ToolbarButton;
    disabledCloneButton: ToolbarButton;
    /**
     * Creates the Widget instance by attaching the clone button to the File Browser toolbar and Git Clone modal.
     * @param factory
     */
    constructor(factory: IFileBrowserFactory);
    /**
     * Event listener for the `pathChanged` event in the file browser. Checks if the current file browser path is a
     * Git repo and disables/enables the clone button accordingly.
     */
    disableIfInGitDirectory(): void;
    /**
     * Makes the API call to the server.
     *
     * @param cloneUrl
     */
    private makeApiCall;
    /**
     * Displays the error dialog when the Git Clone operation fails.
     * @param body the message to be shown in the body of the modal.
     */
    private showErrorDialog;
    /**
     * Creates the CSS style for the Git Clone button image.
     */
    private gitTabStyleEnabled;
    /**
     * Creates the CSS style for the Git Clone button image.
     */
    private gitTabStyleDisabled;
    /**
     * Callback method on Git Clone button in the File Browser toolbar.
     * 1. Invokes a new dialog box with form fields.
     * 2. Invokes the server API with the form input.
     */
    private doGitClone;
}
