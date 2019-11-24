import { JupyterLabPlugin } from '@jupyterlab/application';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
/**
 * A plugin providing a rendermime registry.
 */
declare const plugin: JupyterLabPlugin<RenderMimeRegistry>;
/**
 * Export the plugin as default.
 */
export default plugin;
