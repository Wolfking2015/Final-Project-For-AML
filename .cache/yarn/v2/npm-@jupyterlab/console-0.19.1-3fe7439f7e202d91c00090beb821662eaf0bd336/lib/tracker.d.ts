import { IInstanceTracker } from '@jupyterlab/apputils';
import { Token } from '@phosphor/coreutils';
import { ConsolePanel } from './panel';
/**
 * The console tracker token.
 */
export declare const IConsoleTracker: Token<IConsoleTracker>;
/**
 * A class that tracks console widgets.
 */
export interface IConsoleTracker extends IInstanceTracker<ConsolePanel> {
}
