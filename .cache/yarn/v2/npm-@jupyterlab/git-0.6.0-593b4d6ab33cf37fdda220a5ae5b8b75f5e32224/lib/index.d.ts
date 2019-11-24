import { GitWidget } from './components/GitWidget';
import { ILayoutRestorer, JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { Token } from '@phosphor/coreutils';
import { IDiffCallback } from './git';
export { IDiffCallback } from './git';
import '../style/variables.css';
import { GitClone } from './gitClone';
export declare const EXTENSION_ID = "jupyter.extensions.git_plugin";
export declare const IGitExtension: Token<IGitExtension>;
/** Interface for extension class */
export interface IGitExtension {
    registerDiffProvider(filetypes: string[], callback: IDiffCallback): void;
}
/**
 * The default running sessions extension.
 */
declare const plugin: JupyterLabPlugin<IGitExtension>;
/**
 * Export the plugin as default.
 */
export default plugin;
/** Main extension class */
export declare class GitExtension implements IGitExtension {
    gitPlugin: GitWidget;
    gitCloneWidget: GitClone;
    constructor(app: JupyterLab, restorer: ILayoutRestorer, factory: IFileBrowserFactory);
    registerDiffProvider(filetypes: string[], callback: IDiffCallback): void;
    performDiff(filename: string, revisionA: string, revisionB: string): void;
    private app;
    private diffProviders;
}
