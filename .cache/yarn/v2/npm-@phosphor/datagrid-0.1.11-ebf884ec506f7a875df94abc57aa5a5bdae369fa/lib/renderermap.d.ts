import { ISignal } from '@phosphor/signaling';
import { CellRenderer } from './cellrenderer';
import { DataModel } from './datamodel';
/**
 * An object which manages a mapping of cell renderers.
 *
 * #### Notes
 * This class is used to configure cell renderers for a data grid.
 */
export declare class RendererMap {
    /**
     * Construct a new renderer map.
     *
     * @param options - The options for initializing the map.
     */
    constructor(options?: RendererMap.IOptions);
    /**
     * A signal emitted when the map contents are changed.
     */
    readonly changed: ISignal<this, void>;
    /**
     * Get the cell renderer to use for the given region and metadata.
     *
     * @param region - The cell region of interest.
     *
     * @param metadata - The data model metadata for the region.
     *
     * @returns The best matching cell renderer, or `undefined`.
     *
     * #### Notes
     * Non-string metadata values are ignored.
     */
    get(region: DataModel.CellRegion, metadata: DataModel.Metadata): CellRenderer | undefined;
    /**
     * Set the cell renderer for a particular region and metadata.
     *
     * @param region - The cell region of interest.
     *
     * @param metadata - The metadata to match against the model.
     *
     * @param renderer - The cell renderer to set in the map.
     *
     * #### Notes
     * The keys and values in the supplied metadata are matched against
     * the metadata supplied by the data model. The given metadata must
     * be an exact matching subset of the model metadata in order for
     * there to be a match.
     *
     * Matches are ranked according the number of matched values, with
     * ties broken based on the priorty order given to the constructor.
     *
     * Non-string metadata values are ignored.
     */
    set(region: DataModel.CellRegion, metadata: DataModel.Metadata, renderer: CellRenderer): void;
    /**
     * Remove all custom cell renderers from the map.
     */
    clear(): void;
    private _ranks;
    private _entries;
    private _changed;
    private _renderers;
}
/**
 * The namespace for the `RendererMap` class statics.
 */
export declare namespace RendererMap {
    /**
     * An options object for initializing a renderer map.
     */
    interface IOptions {
        /**
         * The priority of the metadata keys used for matching.
         *
         * Keys at the front of the array have a higher priority. Metadata
         * keys which are not included in the array are ordered by locale.
         *
         * The default is `[]`.
         */
        priority?: string[];
    }
}
