import { IInstanceTracker, MainAreaWidget } from '@jupyterlab/apputils';
import { Token } from '@phosphor/coreutils';
import { Terminal } from './widget';
import '../style/index.css';
export * from './widget';
/**
 * A class that tracks editor widgets.
 */
export interface ITerminalTracker extends IInstanceTracker<MainAreaWidget<Terminal>> {
}
/**
 * The editor tracker token.
 */
export declare const ITerminalTracker: Token<ITerminalTracker>;
