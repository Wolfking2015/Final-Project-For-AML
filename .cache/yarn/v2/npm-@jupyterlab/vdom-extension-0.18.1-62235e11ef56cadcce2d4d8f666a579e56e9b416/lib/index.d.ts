import { Widget } from '@phosphor/widgets';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import '../style/index.css';
/**
 * The MIME type for VDOM.
 */
export declare const MIME_TYPE = "application/vdom.v1+json";
/**
 * A renderer for declarative virtual DOM content.
 */
export declare class RenderedVDOM extends Widget implements IRenderMime.IRenderer {
    /**
     * Create a new widget for rendering DOM.
     */
    constructor(options: IRenderMime.IRendererOptions);
    /**
     * Render VDOM into this widget's node.
     */
    renderModel(model: IRenderMime.IMimeModel): Promise<void>;
    private _mimeType;
}
/**
 * A mime renderer factory for VDOM data.
 */
export declare const rendererFactory: IRenderMime.IRendererFactory;
declare const extensions: IRenderMime.IExtension | IRenderMime.IExtension[];
export default extensions;
