import { Widget } from '@phosphor/widgets';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import '../style/index.css';
/**
 * The MIME type for PDF.
 */
export declare const MIME_TYPE = "application/pdf";
export declare const PDF_CLASS = "jp-PDFViewer";
export declare const PDF_CONTAINER_CLASS = "jp-PDFContainer";
/**
 * A class for rendering a PDF document.
 */
export declare class RenderedPDF extends Widget implements IRenderMime.IRenderer {
    constructor();
    /**
     * Render PDF into this widget's node.
     */
    renderModel(model: IRenderMime.IMimeModel): Promise<void>;
    /**
     * Dispose of the resources held by the pdf widget.
     */
    dispose(): void;
    private _objectUrl;
}
/**
 * A mime renderer factory for PDF data.
 */
export declare const rendererFactory: IRenderMime.IRendererFactory;
declare const extensions: IRenderMime.IExtension | IRenderMime.IExtension[];
export default extensions;
