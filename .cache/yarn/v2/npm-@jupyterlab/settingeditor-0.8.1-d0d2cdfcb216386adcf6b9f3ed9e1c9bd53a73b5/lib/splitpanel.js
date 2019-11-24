"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
const signaling_1 = require("@phosphor/signaling");
/**
 * A deprecated split panel that will be removed when the phosphor split panel
 * supports a handle moved signal. See https://github.com/phosphorjs/phosphor/issues/297.
 */
class SplitPanel extends widgets_1.SplitPanel {
    constructor() {
        super(...arguments);
        /**
         * Emits when the split handle has moved.
         */
        this.handleMoved = new signaling_1.Signal(this);
    }
    handleEvent(event) {
        super.handleEvent(event);
        if (event.type === 'mouseup') {
            this.handleMoved.emit(undefined);
        }
    }
}
exports.SplitPanel = SplitPanel;
