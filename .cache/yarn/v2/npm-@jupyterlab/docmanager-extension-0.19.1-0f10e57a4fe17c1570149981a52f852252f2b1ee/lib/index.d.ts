import { JupyterLabPlugin } from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
/**
 * The default document manager provider.
 */
declare const plugin: JupyterLabPlugin<IDocumentManager>;
/**
 * Export the plugin as default.
 */
export default plugin;
