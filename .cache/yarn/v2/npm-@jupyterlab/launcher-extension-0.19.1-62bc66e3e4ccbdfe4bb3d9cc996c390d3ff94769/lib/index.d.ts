import { JupyterLabPlugin } from '@jupyterlab/application';
import { ILauncher } from '@jupyterlab/launcher';
import '../style/index.css';
/**
 * A service providing an interface to the the launcher.
 */
declare const plugin: JupyterLabPlugin<ILauncher>;
/**
 * Export the plugin as default.
 */
export default plugin;
