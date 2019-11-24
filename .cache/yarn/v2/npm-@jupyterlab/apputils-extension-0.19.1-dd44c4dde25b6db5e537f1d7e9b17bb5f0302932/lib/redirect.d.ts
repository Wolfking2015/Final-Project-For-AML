import { Widget } from '@phosphor/widgets';
/**
 * The UI for the recovery option to redirect to a different workspace.
 */
export declare class RedirectForm extends Widget {
    /**
     * Create a redirect form.
     */
    constructor();
    /**
     * The text label of the form.
     */
    label: string;
    /**
     * The input placeholder.
     */
    placeholder: string;
    /**
     * The warning message.
     */
    warning: string;
    /**
     * Returns the input value.
     */
    getValue(): string;
}
/**
 * Return a new redirect form, populated with default language.
 */
export declare function createRedirectForm(warn?: boolean): RedirectForm;
