"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const signaling_1 = require("@phosphor/signaling");
/**
 * A handler for capturing API messages from other sessions that should be
 * rendered in a given parent.
 */
class ForeignHandler {
    /**
     * Construct a new foreign message handler.
     */
    constructor(options) {
        this._cells = new Map();
        this._enabled = false;
        this._isDisposed = false;
        this.session = options.session;
        this.session.iopubMessage.connect(this.onIOPubMessage, this);
        this._factory = options.cellFactory;
        this._parent = options.parent;
    }
    /**
     * Set whether the handler is able to inject foreign cells into a console.
     */
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        this._enabled = value;
    }
    /**
     * The foreign handler's parent receiver.
     */
    get parent() {
        return this._parent;
    }
    /**
     * Test whether the handler is disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose the resources held by the handler.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._cells.clear();
        signaling_1.Signal.clearData(this);
    }
    /**
     * Handler IOPub messages.
     *
     * @returns `true` if the message resulted in a new cell injection or a
     * previously injected cell being updated and `false` for all other messages.
     */
    onIOPubMessage(sender, msg) {
        // Only process messages if foreign cell injection is enabled.
        if (!this._enabled) {
            return false;
        }
        let kernel = this.session.kernel;
        if (!kernel) {
            return false;
        }
        // Check whether this message came from an external session.
        let parent = this._parent;
        let session = msg.parent_header.session;
        if (session === kernel.clientId) {
            return false;
        }
        let msgType = msg.header.msg_type;
        let parentHeader = msg.parent_header;
        let parentMsgId = parentHeader.msg_id;
        let cell;
        switch (msgType) {
            case 'execute_input':
                let inputMsg = msg;
                cell = this._newCell(parentMsgId);
                let model = cell.model;
                model.executionCount = inputMsg.content.execution_count;
                model.value.text = inputMsg.content.code;
                model.trusted = true;
                parent.update();
                return true;
            case 'execute_result':
            case 'display_data':
            case 'stream':
            case 'error':
                if (!this._cells.has(parentMsgId)) {
                    // This is an output from an input that was broadcast before our
                    // session started listening. We will ignore it.
                    console.warn('Ignoring output with no associated input cell.');
                    return false;
                }
                let output = msg.content;
                cell = this._cells.get(parentMsgId);
                if (cell) {
                    output.output_type = msgType;
                    cell.model.outputs.add(output);
                }
                parent.update();
                return true;
            case 'clear_output':
                let wait = msg.content.wait;
                cell = this._cells.get(parentMsgId);
                if (cell) {
                    cell.model.outputs.clear(wait);
                }
                return true;
            default:
                return false;
        }
    }
    /**
     * Create a new code cell for an input originated from a foreign session.
     */
    _newCell(parentMsgId) {
        let cell = this._factory();
        this._cells.set(parentMsgId, cell);
        this._parent.addCell(cell);
        return cell;
    }
}
exports.ForeignHandler = ForeignHandler;
