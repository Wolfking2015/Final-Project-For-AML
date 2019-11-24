import { ISettingRegistry } from '@jupyterlab/coreutils';
import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
/**
 * A tabular editor for plugin settings.
 */
export declare class TableEditor extends Widget {
    /**
     * Create a new table editor for settings.
     */
    constructor(options: TableEditor.IOptions);
    /**
     * Tests whether the settings have been modified and need saving.
     */
    readonly isDirty: boolean;
    /**
     * The plugin settings.
     */
    settings: ISettingRegistry.ISettings | null;
    /**
     * Handle `'update-request'` messages.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Handle setting changes.
     */
    private _onSettingsChanged;
    private _settings;
}
/**
 * A namespace for `TableEditor` statics.
 */
export declare namespace TableEditor {
    /**
     * The instantiation options for a table editor.
     */
    interface IOptions {
        /**
         * A function the table editor calls on save errors.
         */
        onSaveError: (reason: any) => void;
    }
}
