import { CodeEditor } from '@jupyterlab/codeeditor';
import { ISettingRegistry, IStateDB } from '@jupyterlab/coreutils';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
import { CommandRegistry } from '@phosphor/commands';
import { JSONObject } from '@phosphor/coreutils';
import { Message } from '@phosphor/messaging';
import { ISignal } from '@phosphor/signaling';
import { Widget } from '@phosphor/widgets';
/**
 * An interface for modifying and saving application settings.
 */
export declare class SettingEditor extends Widget {
    /**
     * Create a new setting editor.
     */
    constructor(options: SettingEditor.IOptions);
    /**
     * The state database key for the editor's state management.
     */
    readonly key: string;
    /**
     * The setting registry used by the editor.
     */
    readonly registry: ISettingRegistry;
    /**
     * The state database used to store layout.
     */
    readonly state: IStateDB;
    /**
     * Whether the raw editor revert functionality is enabled.
     */
    readonly canRevertRaw: boolean;
    /**
     * Whether the raw editor save functionality is enabled.
     */
    readonly canSaveRaw: boolean;
    /**
     * Emits when the commands passed in at instantiation change.
     */
    readonly commandsChanged: ISignal<any, string[]>;
    /**
     * Whether the debug panel is visible.
     */
    readonly isDebugVisible: boolean;
    /**
     * The currently loaded settings.
     */
    readonly settings: ISettingRegistry.ISettings;
    /**
     * The inspectable raw user editor source for the currently loaded settings.
     */
    readonly source: CodeEditor.IEditor;
    /**
     * Dispose of the resources held by the setting editor.
     */
    dispose(): void;
    /**
     * Revert raw editor back to original settings.
     */
    revert(): void;
    /**
     * Save the contents of the raw editor.
     */
    save(): Promise<void>;
    /**
     * Toggle the debug functionality.
     */
    toggleDebug(): void;
    /**
     * Handle `'after-attach'` messages.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `'close-request'` messages.
     */
    protected onCloseRequest(msg: Message): void;
    /**
     * Get the state of the panel.
     */
    private _fetchState;
    /**
     * Handle root level layout state changes.
     */
    private _onStateChanged;
    /**
     * Set the state of the setting editor.
     */
    private _saveState;
    /**
     * Set the layout sizes.
     */
    private _setLayout;
    /**
     * Set the presets of the setting editor.
     */
    private _setState;
    private _editor;
    private _fetching;
    private _instructions;
    private _list;
    private _panel;
    private _saving;
    private _state;
    private _when;
}
/**
 * A namespace for `SettingEditor` statics.
 */
export declare namespace SettingEditor {
    /**
     * The instantiation options for a setting editor.
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
         * The editor factory used by the setting editor.
         */
        editorFactory: CodeEditor.Factory;
        /**
         * The state database key for the editor's state management.
         */
        key: string;
        /**
         * The setting registry the editor modifies.
         */
        registry: ISettingRegistry;
        /**
         * The optional MIME renderer to use for rendering debug messages.
         */
        rendermime?: RenderMimeRegistry;
        /**
         * The state database used to store layout.
         */
        state: IStateDB;
        /**
         * The point after which the editor should restore its state.
         */
        when?: Promise<any> | Array<Promise<any>>;
    }
    /**
     * The layout state for the setting editor.
     */
    interface ILayoutState extends JSONObject {
        /**
         * The layout state for a plugin editor container.
         */
        container: IPluginLayout;
        /**
         * The relative sizes of the plugin list and plugin editor.
         */
        sizes: number[];
    }
    /**
     * The layout information that is stored and restored from the state database.
     */
    interface IPluginLayout extends JSONObject {
        /**
         * The current plugin being displayed.
         */
        plugin: string;
        editor: 'raw' | 'table';
        sizes: number[];
    }
}
