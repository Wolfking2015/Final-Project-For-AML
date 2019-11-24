import { IInstanceTracker } from '@jupyterlab/apputils';
import { IDocumentWidget } from '@jupyterlab/docregistry';
import { Token } from '@phosphor/coreutils';
import { FileEditor } from './widget';
import '../style/index.css';
export * from './widget';
/**
 * A class that tracks editor widgets.
 */
export interface IEditorTracker extends IInstanceTracker<IDocumentWidget<FileEditor>> {
}
/**
 * The editor tracker token.
 */
export declare const IEditorTracker: Token<IEditorTracker>;
