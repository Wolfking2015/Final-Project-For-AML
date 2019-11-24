import { SplitPanel as SPanel } from '@phosphor/widgets';
import { ISignal } from '@phosphor/signaling';
/**
 * A deprecated split panel that will be removed when the phosphor split panel
 * supports a handle moved signal. See https://github.com/phosphorjs/phosphor/issues/297.
 */
export declare class SplitPanel extends SPanel {
    /**
     * Emits when the split handle has moved.
     */
    readonly handleMoved: ISignal<any, void>;
    handleEvent(event: Event): void;
}
