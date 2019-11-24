import { IInstanceTracker } from '@jupyterlab/apputils';
import { IDocumentWidget } from '@jupyterlab/docregistry';
import { Token } from '@phosphor/coreutils';
import { ImageViewer } from './widget';
import '../style/index.css';
export * from './widget';
/**
 * A class that tracks editor widgets.
 */
export interface IImageTracker extends IInstanceTracker<IDocumentWidget<ImageViewer>> {
}
/**
 * The editor tracker token.
 */
export declare const IImageTracker: Token<IImageTracker>;
