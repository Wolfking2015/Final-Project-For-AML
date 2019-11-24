"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const widgets_1 = require("@phosphor/widgets");
const typestyle_1 = require("typestyle");
const git_1 = require("./git");
/**
 * The widget encapsulating the Git Clone UI:
 * 1. Includes the Git Clone button in the File Browser toolbar.
 * 2. Includes the modal (UI + callbacks) which invoked to enable Git Clone functionality.
 */
class GitClone extends widgets_1.Widget {
    /**
     * Creates the Widget instance by attaching the clone button to the File Browser toolbar and Git Clone modal.
     * @param factory
     */
    constructor(factory) {
        super();
        /**
         * Creates the CSS style for the Git Clone button image.
         */
        this.gitTabStyleEnabled = typestyle_1.style({
            backgroundImage: 'var(--jp-icon-git-clone)'
        });
        /**
         * Creates the CSS style for the Git Clone button image.
         */
        this.gitTabStyleDisabled = typestyle_1.style({
            backgroundImage: 'var(--jp-icon-git-clone-disabled)'
        });
        this.id = 'git-clone-button';
        this.fileBrowser = factory.defaultBrowser;
        this.gitApi = new git_1.Git();
        // Initialize the clone button in enabled state
        this.enabledCloneButton = new apputils_1.ToolbarButton({
            iconClassName: `${this.gitTabStyleEnabled} jp-Icon jp-Icon-16`,
            onClick: () => {
                this.doGitClone();
            },
            tooltip: 'Git Clone'
        });
        this.disabledCloneButton = new apputils_1.ToolbarButton({
            iconClassName: `${this.gitTabStyleDisabled} jp-Icon jp-Icon-16`,
            tooltip: 'Cloning disabled within a git repository'
        });
        this.fileBrowser.toolbar.addItem('gitClone', this.enabledCloneButton);
        // Attached a listener on the pathChanged event.
        factory.defaultBrowser.model.pathChanged.connect(() => this.disableIfInGitDirectory());
    }
    /**
     * Event listener for the `pathChanged` event in the file browser. Checks if the current file browser path is a
     * Git repo and disables/enables the clone button accordingly.
     */
    disableIfInGitDirectory() {
        this.gitApi
            .allHistory(this.fileBrowser.model.path)
            .then(response => {
            if (response.code === 0) {
                this.enabledCloneButton.parent = null;
                this.fileBrowser.toolbar.addItem('disabledCloneButton', this.disabledCloneButton);
            }
            else {
                this.disabledCloneButton.parent = null;
                this.fileBrowser.toolbar.addItem('enabledCloneButton', this.enabledCloneButton);
            }
        })
            .catch(() => {
            // NOOP
        });
    }
    /**
     * Makes the API call to the server.
     *
     * @param cloneUrl
     */
    makeApiCall(cloneUrl) {
        this.gitApi
            .clone(this.fileBrowser.model.path, cloneUrl)
            .then(response => {
            if (response.code !== 0) {
                this.showErrorDialog(response.message);
            }
        })
            .catch(() => this.showErrorDialog());
    }
    /**
     * Displays the error dialog when the Git Clone operation fails.
     * @param body the message to be shown in the body of the modal.
     */
    showErrorDialog(body = '') {
        return apputils_1.showDialog({
            title: 'Clone failed',
            body: body,
            buttons: [apputils_1.Dialog.warnButton({ label: 'DISMISS' })]
        }).then(() => {
            // NO-OP
        });
    }
    /**
     * Callback method on Git Clone button in the File Browser toolbar.
     * 1. Invokes a new dialog box with form fields.
     * 2. Invokes the server API with the form input.
     */
    doGitClone() {
        return __awaiter(this, void 0, void 0, function* () {
            const dialog = new apputils_1.Dialog({
                title: 'Clone a repo',
                body: new GitCloneForm(),
                focusNodeSelector: 'input',
                buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.okButton({ label: 'CLONE' })]
            });
            const result = yield dialog.launch();
            dialog.dispose();
            if (typeof result.value !== 'undefined' && result.value) {
                const cloneUrl = result.value;
                this.makeApiCall(cloneUrl);
            }
            else {
                // NOOP
            }
        });
    }
}
exports.GitClone = GitClone;
/**
 * The UI for the form fields shown within the Clone modal.
 */
class GitCloneForm extends widgets_1.Widget {
    /**
     * Create a redirect form.
     */
    constructor() {
        super({ node: GitCloneForm.createFormNode() });
    }
    static createFormNode() {
        const node = document.createElement('div');
        const label = document.createElement('label');
        const input = document.createElement('input');
        const text = document.createElement('span');
        const warning = document.createElement('div');
        node.className = 'jp-RedirectForm';
        warning.className = 'jp-RedirectForm-warning';
        text.textContent = 'Enter the Clone URI of the repository';
        input.placeholder = 'https://github.com/jupyterlab/jupyterlab-git.git';
        label.appendChild(text);
        label.appendChild(input);
        node.appendChild(label);
        node.appendChild(warning);
        return node;
    }
    /**
     * Returns the input value.
     */
    getValue() {
        return encodeURIComponent(this.node.querySelector('input').value);
    }
}
