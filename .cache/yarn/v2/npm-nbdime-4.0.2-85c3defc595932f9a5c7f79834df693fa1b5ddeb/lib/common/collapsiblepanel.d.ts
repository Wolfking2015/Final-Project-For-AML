import { Widget, Panel } from '@phosphor/widgets';
/**
 * CollapsiblePanel
 */
export declare class CollapsiblePanel extends Panel {
    static createHeader(headerTitle?: string): Panel;
    constructor(inner: Widget, headerTitle?: string, collapsed?: boolean);
    toggleCollapsed(): void;
    readonly collapsed: boolean;
    headerTitle: string;
    inner: Widget;
    header: Panel;
    slider: Panel;
    container: Panel;
    button: HTMLElement;
}
//# sourceMappingURL=collapsiblepanel.d.ts.map