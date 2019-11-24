import { JupyterLab } from '@jupyterlab/application';
import { ServiceManager } from '@jupyterlab/services';
/**
 * The command IDs used by the git plugin.
 */
export declare namespace CommandIDs {
    const gitUI = "git:ui";
    const gitTerminal = "git:create-new-terminal";
    const gitTerminalCommand = "git:terminal-command";
    const gitInit = "git:init";
    const setupRemotes = "git:tutorial-remotes";
    const googleLink = "git:google-link";
}
/**
 * Add the commands for the git extension.
 */
export declare function addCommands(app: JupyterLab, services: ServiceManager): void;
