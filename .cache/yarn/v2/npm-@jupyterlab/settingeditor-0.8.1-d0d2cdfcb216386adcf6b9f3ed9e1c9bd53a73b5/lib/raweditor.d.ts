import { CodeEditor } from '@jupyterlab/codeeditor';
import { ISettingRegistry } from '@jupyterlab/coreutils';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
import { CommandRegistry } from '@phosphor/commands';
import { Message } from '@phosphor/messaging';
import { ISignal } from '@phosphor/signaling';
import { SplitPanel } from './splitpanel';
/**
 * A raw JSON settings editor.
 */
export declare class RawEditor extends SplitPanel {
    /**
     * Create a new plugin editor.
     */
    constructor(options: RawEditor.IOptions);
    /**
     * The setting registry used by the editor.
     */
    readonly registry: ISettingRegistry;
    /**
     * Whether the raw editor revert functionality is enabled.
     */
    readonly canRevert: boolean;
    /**
     * Whether the raw editor save functionality is enabled.
     */
    readonly canSave: boolean;
    /**
     * Emits when the commands passed in at instantiation change.
     */
    readonly commandsChanged: ISignal<any, string[]>;
    /**
     * Whether the debug panel is visible.
     */
    readonly isDebugVisible: boolean;
    /**
     * Tests whether the settings have been modified and need saving.
     */
    readonly isDirty: boolean;
    /**
     * The plugin settings being edited.
     */
    settings: ISettingRegistry.ISettings | null;
    /**
     * Get the relative sizes of the two editor panels.
     */
    sizes: number[];
    /**
     * The inspectable source editor for user input.
     */
    readonly source: CodeEditor.IEditor;
    /**
     * Dispose of the resources held by the raw editor.
     */
    dispose(): void;
    /**
     * Revert the editor back to original settings.
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
     * Handle `after-attach` messages.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `'update-request'` messages.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Handle text changes in the underlying editor.
     */
    private _onTextChanged;
    /**
     * Handle updates to the settings.
     */
    private _onSettingsChanged;
    private _updateToolbar;
    private _canRevert;
    private _canSave;
    private _commands;
    private _commandsChanged;
    private _defaults;
    private _inspector;
    private _onSaveError;
    private _settings;
    private _toolbar;
    private _user;
}
/**
 * A namespace for `RawEditor` statics.
 */
export declare namespace RawEditor {
    /**
     * The toolbar commands and registry for the setting editor toolbar.
     */
    interface ICommandBundle {
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
    }
    /**
     * The instantiation options for a raw editor.
     */
    interface IOptions {
        /**
         * The toolbar commands and registry for the setting editor toolbar.
         */
        commands: ICommandBundle;
        /**
         * The editor factory used by the raw editor.
         */
        editorFactory: CodeEditor.Factory;
        /**
         * A function the raw editor calls on save errors.
         */
        onSaveError: (reason: any) => void;
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
