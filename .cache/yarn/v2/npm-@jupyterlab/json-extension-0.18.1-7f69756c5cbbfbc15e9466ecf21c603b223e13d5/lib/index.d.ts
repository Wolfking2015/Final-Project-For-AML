import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Widget } from '@phosphor/widgets';
import '../style/index.css';
/**
 * The MIME type for JSON.
 */
export declare const MIME_TYPE = "application/json";
/**
 * A renderer for JSON data.
 */
export declare class RenderedJSON extends Widget implements IRenderMime.IRenderer {
    /**
     * Create a new widget for rendering JSON.
     */
    constructor(options: IRenderMime.IRendererOptions);
    /**
     * Render JSON into this widget's node.
     */
    renderModel(model: IRenderMime.IMimeModel): Promise<void>;
    private _mimeType;
}
/**
 * A mime renderer factory for JSON data.
 */
export declare const rendererFactory: IRenderMime.IRendererFactory;
declare const extensions: IRenderMime.IExtension | IRenderMime.IExtension[];
export default extensions;
