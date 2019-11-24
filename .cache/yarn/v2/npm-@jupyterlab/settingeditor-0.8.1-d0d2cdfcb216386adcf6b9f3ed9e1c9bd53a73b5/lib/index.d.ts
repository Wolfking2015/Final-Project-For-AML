import { IInstanceTracker, MainAreaWidget } from '@jupyterlab/apputils';
import { Token } from '@phosphor/coreutils';
import { SettingEditor } from './settingeditor';
import '../style/settingeditor.css';
export * from './settingeditor';
/**
 * The setting editor tracker token.
 */
export declare const ISettingEditorTracker: Token<ISettingEditorTracker>;
/**
 * A class that tracks the setting editor.
 */
export interface ISettingEditorTracker extends IInstanceTracker<MainAreaWidget<SettingEditor>> {
}
