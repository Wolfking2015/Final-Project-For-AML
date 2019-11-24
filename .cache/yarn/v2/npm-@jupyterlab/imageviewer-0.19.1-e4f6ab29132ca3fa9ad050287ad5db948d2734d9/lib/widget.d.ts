import { ABCWidgetFactory, DocumentRegistry, IDocumentWidget } from '@jupyterlab/docregistry';
import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
/**
 * A widget for images.
 */
export declare class ImageViewer extends Widget {
    /**
     * Construct a new image widget.
     */
    constructor(context: DocumentRegistry.Context);
    /**
     * The image widget's context.
     */
    readonly context: DocumentRegistry.Context;
    /**
     * A promise that resolves when the image viewer is ready.
     */
    readonly ready: Promise<void>;
    /**
     * The scale factor for the image.
     */
    scale: number;
    /**
     * The color inversion of the image.
     */
    colorinversion: number;
    /**
     * Reset rotation and flip transformations.
     */
    resetRotationFlip(): void;
    /**
     * Rotate the image counter-clockwise (left).
     */
    rotateCounterclockwise(): void;
    /**
     * Rotate the image clockwise (right).
     */
    rotateClockwise(): void;
    /**
     * Flip the image horizontally.
     */
    flipHorizontal(): void;
    /**
     * Flip the image vertically.
     */
    flipVertical(): void;
    /**
     * Handle `update-request` messages for the widget.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Handle `'activate-request'` messages.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * Handle a change to the title.
     */
    private _onTitleChanged;
    /**
     * Render the widget content.
     */
    private _render;
    /**
     * Update the image CSS style, including the transform and filter.
     */
    private _updateStyle;
    private _format;
    private _mimeType;
    private _scale;
    private _matrix;
    private _colorinversion;
    private _ready;
    private _img;
}
/**
 * A widget factory for images.
 */
export declare class ImageViewerFactory extends ABCWidgetFactory<IDocumentWidget<ImageViewer>> {
    /**
     * Create a new widget given a context.
     */
    protected createNewWidget(context: DocumentRegistry.IContext<DocumentRegistry.IModel>): IDocumentWidget<ImageViewer>;
}
