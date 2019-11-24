import { InspectorPanel } from '@jupyterlab/inspector';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
import { RawEditor } from './raweditor';
/**
 * Create a raw editor inspector.
 */
export declare function createInspector(editor: RawEditor, rendermime?: RenderMimeRegistry): InspectorPanel;
