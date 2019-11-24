import { CodeEditor } from '@jupyterlab/codeeditor';
import { IDataConnector } from '@jupyterlab/coreutils';
import { Token } from '@phosphor/coreutils';
import { Widget } from '@phosphor/widgets';
import { CompletionHandler } from './handler';
import '../style/index.css';
export * from './handler';
export * from './kernelconnector';
export * from './contextconnector';
export * from './connector';
export * from './model';
export * from './widget';
/**
 * The completion manager token.
 */
export declare const ICompletionManager: Token<ICompletionManager>;
/**
 * A manager to register completers with parent widgets.
 */
export interface ICompletionManager {
    /**
     * Register a completable object with the completion manager.
     *
     * @returns A completable object whose attributes can be updated as necessary.
     */
    register(completable: ICompletionManager.ICompletable): ICompletionManager.ICompletableAttributes;
}
/**
 * A namespace for `ICompletionManager` interface specifications.
 */
export declare namespace ICompletionManager {
    /**
     * The attributes of a completable object that can change and sync at runtime.
     */
    interface ICompletableAttributes {
        /**
         * The host editor for the completer.
         */
        editor: CodeEditor.IEditor | null;
        /**
         * The data connector used to populate the completer.
         */
        connector: IDataConnector<CompletionHandler.IReply, void, CompletionHandler.IRequest>;
    }
    /**
     * An interface for completer-compatible objects.
     */
    interface ICompletable extends ICompletableAttributes {
        /**
         * The parent of the completer; the completer resources dispose with parent.
         */
        readonly parent: Widget;
    }
}
