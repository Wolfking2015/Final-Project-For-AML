import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { IMainMenu, EditMenu, FileMenu, KernelMenu, RunMenu, SettingsMenu, ViewMenu, TabsMenu } from '@jupyterlab/mainmenu';
/**
 * A namespace for command IDs of semantic extension points.
 */
export declare namespace CommandIDs {
    const activatePreviouslyUsedTab = "tabmenu:activate-previously-used-tab";
    const undo = "editmenu:undo";
    const redo = "editmenu:redo";
    const clearCurrent = "editmenu:clear-current";
    const clearAll = "editmenu:clear-all";
    const find = "editmenu:find";
    const findAndReplace = "editmenu:find-and-replace";
    const goToLine = "editmenu:go-to-line";
    const closeAndCleanup = "filemenu:close-and-cleanup";
    const persistAndSave = "filemenu:persist-and-save";
    const createConsole = "filemenu:create-console";
    const quit = "filemenu:quit";
    const interruptKernel = "kernelmenu:interrupt";
    const restartKernel = "kernelmenu:restart";
    const restartKernelAndClear = "kernelmenu:restart-and-clear";
    const changeKernel = "kernelmenu:change";
    const shutdownKernel = "kernelmenu:shutdown";
    const shutdownAllKernels = "kernelmenu:shutdownAll";
    const wordWrap = "viewmenu:word-wrap";
    const lineNumbering = "viewmenu:line-numbering";
    const matchBrackets = "viewmenu:match-brackets";
    const run = "runmenu:run";
    const runAll = "runmenu:run-all";
    const restartAndRunAll = "runmenu:restart-and-run-all";
    const runAbove = "runmenu:run-above";
    const runBelow = "runmenu:run-below";
}
/**
 * A service providing an interface to the main menu.
 */
declare const menuPlugin: JupyterLabPlugin<IMainMenu>;
/**
 * Create the basic `Edit` menu.
 */
export declare function createEditMenu(app: JupyterLab, menu: EditMenu): void;
/**
 * Create the basic `File` menu.
 */
export declare function createFileMenu(app: JupyterLab, menu: FileMenu): void;
/**
 * Create the basic `Kernel` menu.
 */
export declare function createKernelMenu(app: JupyterLab, menu: KernelMenu): void;
/**
 * Create the basic `View` menu.
 */
export declare function createViewMenu(app: JupyterLab, menu: ViewMenu): void;
export declare function createRunMenu(app: JupyterLab, menu: RunMenu): void;
export declare function createSettingsMenu(app: JupyterLab, menu: SettingsMenu): void;
export declare function createTabsMenu(app: JupyterLab, menu: TabsMenu): void;
export default menuPlugin;
