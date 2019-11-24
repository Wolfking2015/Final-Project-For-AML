import { CodeEditor } from '@jupyterlab/codeeditor';
import { ISettingRegistry } from '@jupyterlab/coreutils';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
import { CommandRegistry } from '@phosphor/commands';
import { Message } from '@phosphor/messaging';
import { ISignal } from '@phosphor/signaling';
import { Widget } from '@phosphor/widgets';
import { RawEditor } from './raweditor';
import { SettingEditor } from './settingeditor';
import { TableEditor } from './tableeditor';
/**
 * An individual plugin settings editor.
 */
export declare class PluginEditor extends Widget {
    /**
     * Create a new plugin editor.
     *
     * @param options - The plugin editor instantiation options.
     */
    constructor(options: PluginEditor.IOptions);
    /**
     * The plugin editor's raw editor.
     */
    readonly raw: RawEditor;
    /**
     * The plugin editor's table editor.
     */
    readonly table: TableEditor;
    /**
     * Tests whether the settings have been modified and need saving.
     */
    readonly isDirty: boolean;
    /**
     * The plugin settings being edited.
     */
    settings: ISettingRegistry.ISettings | null;
    /**
     * The plugin editor layout state.
     */
    state: SettingEditor.IPluginLayout;
    /**
     * A signal that emits when editor layout state changes and needs to be saved.
     */
    readonly stateChanged: ISignal<this, void>;
    /**
     * If the editor is in a dirty state, confirm that the user wants to leave.
     */
    confirm(): Promise<void>;
    /**
     * Dispose of the resources held by the plugin editor.
     */
    dispose(): void;
    /**
     * Handle `after-attach` messages.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `'update-request'` messages.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Handle layout state changes that need to be saved.
     */
    private _onStateChanged;
    private _editor;
    private _rawEditor;
    private _tableEditor;
    private _settings;
    private _stateChanged;
}
/**
 * A namespace for `PluginEditor` statics.
 */
export declare namespace PluginEditor {
    /**
     * The instantiation options for a plugin editor.
     */
    interface IOptions {
        /**
         * The toolbar commands and registry for the setting editor toolbar.
         */
        commands: {
            /**
             * The command registry.
             */
            registry: CommandRegistry;
            /**
             * The debug command ID.
             */
            debug: string;
            /**
             * The revert command ID.
             */
            revert: string;
            /**
             * The save command ID.
             */
            save: string;
        };
        /**
         * The editor factory used by the plugin editor.
         */
        editorFactory: CodeEditor.Factory;
        /**
         * The setting registry used by the editor.
         */
        registry: ISettingRegistry;
        /**
         * The optional MIME renderer to use for rendering debug messages.
         */
        rendermime?: RenderMimeRegistry;
    }
}
