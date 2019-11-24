import { Panel } from '@phosphor/widgets';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { NotebookDiffModel } from '../model';
/**
 * NotebookDiffWidget
 */
export declare class NotebookDiffWidget extends Panel {
    constructor(model: NotebookDiffModel, rendermime: IRenderMimeRegistry);
    /**
     * Start adding sub-widgets.
     *
     * Separated from constructor to allow 'live' adding of widgets
     */
    init(): Promise<void>;
    /**
     * Get the model for the widget.
     *
     * #### Notes
     * This is a read-only property.
     */
    readonly model: NotebookDiffModel;
    private _model;
    private _rendermime;
}
//# sourceMappingURL=notebook.d.ts.map