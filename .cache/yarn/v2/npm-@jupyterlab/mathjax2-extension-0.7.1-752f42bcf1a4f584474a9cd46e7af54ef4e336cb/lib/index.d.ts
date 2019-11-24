import { JupyterLabPlugin } from '@jupyterlab/application';
import { ILatexTypesetter } from '@jupyterlab/rendermime';
/**
 * The MathJax latexTypesetter plugin.
 */
declare const plugin: JupyterLabPlugin<ILatexTypesetter>;
/**
 * Export the plugin as default.
 */
export default plugin;
