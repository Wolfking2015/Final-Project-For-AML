import { JupyterLabPlugin } from '@jupyterlab/application';
import { IEditorTracker } from '@jupyterlab/fileeditor';
/**
 * The editor tracker extension.
 */
declare const plugin: JupyterLabPlugin<IEditorTracker>;
/**
 * Export the plugins as default.
 */
export default plugin;
