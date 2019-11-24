import { VDomRenderer } from '@jupyterlab/apputils';
import { ServiceManager } from '@jupyterlab/services';
import { Message } from '@phosphor/messaging';
import * as React from 'react';
import { ListModel, IEntry, Action } from './model';
/**
 * Search bar VDOM component.
 */
export declare class SearchBar extends React.Component<SearchBar.IProperties, SearchBar.IState> {
    constructor(props: SearchBar.IProperties);
    /**
     * Render the list view using the virtual DOM.
     */
    render(): React.ReactNode;
    /**
     * Handler for search input changes.
     */
    handleChange(e: KeyboardEvent): void;
}
/**
 * The namespace for search bar statics.
 */
export declare namespace SearchBar {
    /**
     * React properties for search bar component.
     */
    interface IProperties {
        /**
         * The placeholder string to use in the search bar input field when empty.
         */
        placeholder: string;
    }
    /**
     * React state for search bar component.
     */
    interface IState {
        /**
         * The value of the search bar input field.
         */
        value: string;
    }
}
/**
 * The namespace for extension entry statics.
 */
export declare namespace ListEntry {
    interface IProperties {
        /**
         * The entry to visualize.
         */
        entry: IEntry;
        /**
         * Callback to use for performing an action on the entry.
         */
        performAction: (action: Action, entry: IEntry) => void;
    }
}
/**
 * List view widget for extensions
 */
export declare function ListView(props: ListView.IProperties): React.ReactElement<any>;
/**
 * The namespace for list view widget statics.
 */
export declare namespace ListView {
    interface IProperties {
        /**
         * The extension entries to display.
         */
        entries: ReadonlyArray<IEntry>;
        /**
         * The number of pages that can be viewed via pagination.
         */
        numPages: number;
        /**
         * The callback to use for changing the page
         */
        onPage: (page: number) => void;
        /**
         * Callback to use for performing an action on an entry.
         */
        performAction: (action: Action, entry: IEntry) => void;
    }
}
/**
 *
 */
export declare class CollapsibleSection extends React.Component<CollapsibleSection.IProperties, CollapsibleSection.IState> {
    constructor(props: CollapsibleSection.IProperties);
    /**
     * Render the collapsible section using the virtual DOM.
     */
    render(): React.ReactNode;
    /**
     * Handler for search input changes.
     */
    onCollapse(): void;
}
/**
 * The namespace for collapsible section statics.
 */
export declare namespace CollapsibleSection {
    /**
     * React properties for collapsible section component.
     */
    interface IProperties {
        /**
         * The header string for section list.
         */
        header: string;
        /**
         * Whether the view will be collapsed initially or not.
         */
        startCollapsed: boolean;
        /**
         * Callback for collapse action.
         */
        onCollapse?: (collapsed: boolean) => void;
        /**
         * Any additional elements to add to the header.
         */
        headerElements?: React.ReactNode;
        /**
         * If given, this will be diplayed instead of the children.
         */
        errorMessage?: string | null;
    }
    /**
     * React state for collapsible section component.
     */
    interface IState {
        /**
         * Whther the section is collapsed or not.
         */
        collapsed: boolean;
    }
}
/**
 * The main view for the discovery extension.
 */
export declare class ExtensionView extends VDomRenderer<ListModel> {
    constructor(serviceManager: ServiceManager);
    /**
     * The search input node.
     */
    readonly inputNode: HTMLInputElement;
    /**
     * Render the extension view using the virtual DOM.
     */
    protected render(): React.ReactElement<any>[];
    /**
     * Callback handler for the user specifies a new search query.
     *
     * @param value The new query.
     */
    onSearch(value: string): void;
    /**
     * Callback handler for the user changes the page of the search result pagination.
     *
     * @param value The pagination page number.
     */
    onPage(value: number): void;
    /**
     * Callback handler for when the user wants to perform an action on an extension.
     *
     * @param action The action to perform.
     * @param entry The entry to perform the action on.
     */
    onAction(action: Action, entry: IEntry): void | Promise<void>;
    /**
     * Handle the DOM events for the command palette.
     *
     * @param event - The DOM event sent to the command palette.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the command palette's DOM node.
     * It should not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * A message handler invoked on a `'before-attach'` message.
     */
    protected onBeforeAttach(msg: Message): void;
    /**
     * A message handler invoked on an `'after-detach'` message.
     */
    protected onAfterDetach(msg: Message): void;
    /**
     * A message handler invoked on an `'activate-request'` message.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * Toggle the focused modifier based on the input node focus state.
     */
    private _toggleFocused;
}
