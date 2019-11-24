import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { InstanceTracker, MainAreaWidget } from '@jupyterlab/apputils';
import { ServiceManager } from '@jupyterlab/services';
import { ITerminalTracker, Terminal } from '@jupyterlab/terminal';
/**
 * The default terminal extension.
 */
declare const plugin: JupyterLabPlugin<ITerminalTracker>;
/**
 * Export the plugin as default.
 */
export default plugin;
/**
 * Add the commands for the terminal.
 */
export declare function addCommands(app: JupyterLab, services: ServiceManager, tracker: InstanceTracker<MainAreaWidget<Terminal>>): void;
