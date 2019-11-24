import { ILayoutRestorer, JupyterLab } from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
/**
 * Activate the command palette.
 */
export declare function activatePalette(app: JupyterLab): ICommandPalette;
/**
 * Restore the command palette.
 */
export declare function restorePalette(app: JupyterLab, restorer: ILayoutRestorer): void;
