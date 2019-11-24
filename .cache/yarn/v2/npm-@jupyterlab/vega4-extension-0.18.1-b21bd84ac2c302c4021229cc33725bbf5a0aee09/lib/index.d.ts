import { Widget } from '@phosphor/widgets';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import '../style/index.css';
/**
 * The MIME type for Vega.
 *
 * #### Notes
 * The version of this follows the major version of Vega.
 */
export declare const VEGA_MIME_TYPE = "application/vnd.vega.v4+json";
/**
 * The MIME type for Vega-Lite.
 *
 * #### Notes
 * The version of this follows the major version of Vega-Lite.
 */
export declare const VEGALITE_MIME_TYPE = "application/vnd.vegalite.v2+json";
/**
 * A widget for rendering Vega or Vega-Lite data, for usage with rendermime.
 */
export declare class RenderedVega extends Widget implements IRenderMime.IRenderer {
    private _result;
    /**
     * Create a new widget for rendering Vega/Vega-Lite.
     */
    constructor(options: IRenderMime.IRendererOptions);
    /**
     * Render Vega/Vega-Lite into this widget's node.
     */
    renderModel(model: IRenderMime.IMimeModel): Promise<void>;
    dispose(): void;
    private _mimeType;
    private _resolver;
}
/**
 * A mime renderer factory for vega data.
 */
export declare const rendererFactory: IRenderMime.IRendererFactory;
declare const extension: IRenderMime.IExtension;
export default extension;
