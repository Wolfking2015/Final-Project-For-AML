"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const widgets_1 = require("@phosphor/widgets");
const git_1 = require("./git");
var Operation;
(function (Operation) {
    Operation["Pull"] = "Pull";
    Operation["Push"] = "Push";
})(Operation = exports.Operation || (exports.Operation = {}));
/**
 * The UI for the content shown within the Git push/pull modal.
 */
class GitPullPushDialog extends widgets_1.Widget {
    /**
     * Instantiates the dialog and makes the relevant service API call.
     */
    constructor(currentFileBrowserPath, operation) {
        super();
        this.operation = operation;
        this.body = this.createBody();
        this.node.appendChild(this.body);
        this.spinner = new apputils_1.Spinner();
        this.node.appendChild(this.spinner.node);
        this.gitApi = new git_1.Git();
        this.executeGitApi(currentFileBrowserPath);
    }
    /**
     * Executes the relevant service API depending on the operation and handles response and errors.
     * @param currentFileBrowserPath the path to the current repo
     */
    executeGitApi(currentFileBrowserPath) {
        switch (this.operation) {
            case Operation.Pull:
                this.gitApi
                    .pull(currentFileBrowserPath)
                    .then(response => {
                    this.handleResponse(response);
                })
                    .catch(() => this.handleError());
                break;
            case Operation.Push:
                this.gitApi
                    .push(currentFileBrowserPath)
                    .then(response => {
                    this.handleResponse(response);
                })
                    .catch(() => this.handleError());
                break;
            default:
                throw new Error(`Invalid operation type: ${this.operation}`);
        }
    }
    /**
     * Handles the response from the server by removing the spinner and showing the appropriate
     * success or error message.
     * @param response the response from the server API call
     */
    handleResponse(response) {
        this.node.removeChild(this.spinner.node);
        this.spinner.dispose();
        if (response.code !== 0) {
            this.handleError(response.message);
        }
        else {
            this.handleSuccess();
        }
    }
    handleError(message = 'Unexpected failure. Please check your Jupyter server logs for more details.') {
        const label = document.createElement('label');
        const text = document.createElement('span');
        text.textContent = `Git ${this.operation} failed with error:`;
        const errorMessage = document.createElement('span');
        errorMessage.textContent = message;
        errorMessage.setAttribute('style', 'background-color:var(--jp-rendermime-error-background)');
        label.appendChild(text);
        label.appendChild(document.createElement('p'));
        label.appendChild(errorMessage);
        this.body.appendChild(label);
    }
    handleSuccess() {
        const label = document.createElement('label');
        const text = document.createElement('span');
        text.textContent = `Git ${this.operation} completed successfully`;
        label.appendChild(text);
        this.body.appendChild(label);
    }
    createBody() {
        const node = document.createElement('div');
        node.className = 'jp-RedirectForm';
        return node;
    }
}
exports.GitPullPushDialog = GitPullPushDialog;
