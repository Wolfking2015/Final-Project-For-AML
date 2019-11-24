"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const signaling_1 = require("@phosphor/signaling");
const rendermime_1 = require("@jupyterlab/rendermime");
/**
 * An object that handles code inspection.
 */
class InspectionHandler {
    /**
     * Construct a new inspection handler for a widget.
     */
    constructor(options) {
        this._disposed = new signaling_1.Signal(this);
        this._editor = null;
        this._ephemeralCleared = new signaling_1.Signal(this);
        this._inspected = new signaling_1.Signal(this);
        this._isDisposed = false;
        this._pending = 0;
        this._standby = true;
        this._connector = options.connector;
        this._rendermime = options.rendermime;
    }
    /**
     * A signal emitted when the handler is disposed.
     */
    get disposed() {
        return this._disposed;
    }
    /**
     * A signal emitted when inspector should clear all items with no history.
     */
    get ephemeralCleared() {
        return this._ephemeralCleared;
    }
    /**
     * A signal emitted when an inspector value is generated.
     */
    get inspected() {
        return this._inspected;
    }
    /**
     * The editor widget used by the inspection handler.
     */
    get editor() {
        return this._editor;
    }
    set editor(newValue) {
        if (newValue === this._editor) {
            return;
        }
        if (this._editor && !this._editor.isDisposed) {
            this._editor.model.value.changed.disconnect(this.onTextChanged, this);
        }
        let editor = (this._editor = newValue);
        if (editor) {
            // Clear ephemeral inspectors in preparation for a new editor.
            this._ephemeralCleared.emit(void 0);
            editor.model.value.changed.connect(this.onTextChanged, this);
        }
    }
    /**
     * Indicates whether the handler makes API inspection requests or stands by.
     *
     * #### Notes
     * The use case for this attribute is to limit the API traffic when no
     * inspector is visible.
     */
    get standby() {
        return this._standby;
    }
    set standby(value) {
        this._standby = value;
    }
    /**
     * Get whether the inspection handler is disposed.
     *
     * #### Notes
     * This is a read-only property.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose of the resources used by the handler.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._disposed.emit(void 0);
        signaling_1.Signal.clearData(this);
    }
    /**
     * Handle a text changed signal from an editor.
     *
     * #### Notes
     * Update the hints inspector based on a text change.
     */
    onTextChanged() {
        // If the handler is in standby mode, bail.
        if (this._standby) {
            return;
        }
        const editor = this.editor;
        if (!editor) {
            return;
        }
        const text = editor.model.value.text;
        const position = editor.getCursorPosition();
        const offset = coreutils_1.Text.jsIndexToCharIndex(editor.getOffsetAt(position), text);
        const update = {
            content: null,
            type: 'hints'
        };
        const pending = ++this._pending;
        this._connector
            .fetch({ offset, text })
            .then(reply => {
            // If handler has been disposed or a newer request is pending, bail.
            if (this.isDisposed || pending !== this._pending) {
                this._inspected.emit(update);
                return;
            }
            const { data } = reply;
            const mimeType = this._rendermime.preferredMimeType(data);
            if (mimeType) {
                const widget = this._rendermime.createRenderer(mimeType);
                const model = new rendermime_1.MimeModel({ data });
                widget.renderModel(model);
                update.content = widget;
            }
            this._inspected.emit(update);
        })
            .catch(reason => {
            // Since almost all failures are benign, fail silently.
            this._inspected.emit(update);
        });
    }
}
exports.InspectionHandler = InspectionHandler;
