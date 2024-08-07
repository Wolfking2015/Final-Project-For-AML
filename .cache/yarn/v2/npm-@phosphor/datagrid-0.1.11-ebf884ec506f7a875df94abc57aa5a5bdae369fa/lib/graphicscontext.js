"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A thin caching wrapper around a 2D canvas rendering context.
 *
 * #### Notes
 * This class is mostly a transparent wrapper around a canvas rendering
 * context which improves performance when writing context state.
 *
 * For best performance, avoid reading state from the `gc`. Writes are
 * cached based on the previously written value.
 *
 * Unless otherwise specified, the API and semantics of this class are
 * identical to the builtin 2D canvas rendering context:
 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 *
 * The wrapped canvas context should not be manipulated externally
 * until the wrapping `GraphicsContext` object is disposed.
 */
var GraphicsContext = /** @class */ (function () {
    /**
     * Create a new graphics context object.
     *
     * @param context - The 2D canvas rendering context to wrap.
     */
    function GraphicsContext(context) {
        this._disposed = false;
        this._context = context;
        this._state = Private.State.create(context);
    }
    GraphicsContext.prototype.dispose = function () {
        // Bail if the gc is already disposed.
        if (this._disposed) {
            return;
        }
        // Mark the gc as disposed.
        this._disposed = true;
        // Pop any unrestored saves.
        while (this._state.next) {
            this._state = this._state.next;
            this._context.restore();
        }
    };
    Object.defineProperty(GraphicsContext.prototype, "isDisposed", {
        get: function () {
            return this._disposed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "fillStyle", {
        get: function () {
            return this._context.fillStyle;
        },
        set: function (value) {
            if (this._state.fillStyle !== value) {
                this._state.fillStyle = value;
                this._context.fillStyle = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "strokeStyle", {
        get: function () {
            return this._context.strokeStyle;
        },
        set: function (value) {
            if (this._state.strokeStyle !== value) {
                this._state.strokeStyle = value;
                this._context.strokeStyle = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "font", {
        get: function () {
            return this._context.font;
        },
        set: function (value) {
            if (this._state.font !== value) {
                this._state.font = value;
                this._context.font = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "textAlign", {
        get: function () {
            return this._context.textAlign;
        },
        set: function (value) {
            if (this._state.textAlign !== value) {
                this._state.textAlign = value;
                this._context.textAlign = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "textBaseline", {
        get: function () {
            return this._context.textBaseline;
        },
        set: function (value) {
            if (this._state.textBaseline !== value) {
                this._state.textBaseline = value;
                this._context.textBaseline = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "lineCap", {
        get: function () {
            return this._context.lineCap;
        },
        set: function (value) {
            if (this._state.lineCap !== value) {
                this._state.lineCap = value;
                this._context.lineCap = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "lineDashOffset", {
        get: function () {
            return this._context.lineDashOffset;
        },
        set: function (value) {
            if (this._state.lineDashOffset !== value) {
                this._state.lineDashOffset = value;
                this._context.lineDashOffset = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "lineJoin", {
        get: function () {
            return this._context.lineJoin;
        },
        set: function (value) {
            if (this._state.lineJoin !== value) {
                this._state.lineJoin = value;
                this._context.lineJoin = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "lineWidth", {
        get: function () {
            return this._context.lineWidth;
        },
        set: function (value) {
            if (this._state.lineWidth !== value) {
                this._state.lineWidth = value;
                this._context.lineWidth = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "miterLimit", {
        get: function () {
            return this._context.miterLimit;
        },
        set: function (value) {
            if (this._state.miterLimit !== value) {
                this._state.miterLimit = value;
                this._context.miterLimit = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "shadowBlur", {
        get: function () {
            return this._context.shadowBlur;
        },
        set: function (value) {
            if (this._state.shadowBlur !== value) {
                this._state.shadowBlur = value;
                this._context.shadowBlur = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "shadowColor", {
        get: function () {
            return this._context.shadowColor;
        },
        set: function (value) {
            if (this._state.shadowColor !== value) {
                this._state.shadowColor = value;
                this._context.shadowColor = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "shadowOffsetX", {
        get: function () {
            return this._context.shadowOffsetX;
        },
        set: function (value) {
            if (this._state.shadowOffsetX !== value) {
                this._state.shadowOffsetX = value;
                this._context.shadowOffsetX = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "shadowOffsetY", {
        get: function () {
            return this._context.shadowOffsetY;
        },
        set: function (value) {
            if (this._state.shadowOffsetY !== value) {
                this._state.shadowOffsetY = value;
                this._context.shadowOffsetY = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "imageSmoothingEnabled", {
        get: function () {
            return this._context.imageSmoothingEnabled;
        },
        set: function (value) {
            if (this._state.imageSmoothingEnabled !== value) {
                this._state.imageSmoothingEnabled = value;
                this._context.imageSmoothingEnabled = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "globalAlpha", {
        get: function () {
            return this._context.globalAlpha;
        },
        set: function (value) {
            if (this._state.globalAlpha !== value) {
                this._state.globalAlpha = value;
                this._context.globalAlpha = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphicsContext.prototype, "globalCompositeOperation", {
        get: function () {
            return this._context.globalCompositeOperation;
        },
        set: function (value) {
            if (this._state.globalCompositeOperation !== value) {
                this._state.globalCompositeOperation = value;
                this._context.globalCompositeOperation = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    GraphicsContext.prototype.getLineDash = function () {
        return this._context.getLineDash();
    };
    GraphicsContext.prototype.setLineDash = function (segments) {
        this._context.setLineDash(segments);
    };
    GraphicsContext.prototype.rotate = function (angle) {
        this._context.rotate(angle);
    };
    GraphicsContext.prototype.scale = function (x, y) {
        this._context.scale(x, y);
    };
    GraphicsContext.prototype.transform = function (m11, m12, m21, m22, dx, dy) {
        this._context.transform(m11, m12, m21, m22, dx, dy);
    };
    GraphicsContext.prototype.translate = function (x, y) {
        this._context.translate(x, y);
    };
    GraphicsContext.prototype.setTransform = function (m11, m12, m21, m22, dx, dy) {
        this._context.setTransform(m11, m12, m21, m22, dx, dy);
    };
    GraphicsContext.prototype.save = function () {
        // Clone an push the current state to the stack.
        this._state = Private.State.push(this._state);
        // Save the wrapped context state.
        this._context.save();
    };
    GraphicsContext.prototype.restore = function () {
        // Bail if there is no state to restore.
        if (!this._state.next) {
            return;
        }
        // Pop the saved state from the stack.
        this._state = Private.State.pop(this._state);
        // Restore the wrapped context state.
        this._context.restore();
    };
    GraphicsContext.prototype.beginPath = function () {
        return this._context.beginPath();
    };
    GraphicsContext.prototype.closePath = function () {
        this._context.closePath();
    };
    GraphicsContext.prototype.isPointInPath = function (x, y, fillRule) {
        var result;
        if (arguments.length === 2) {
            result = this._context.isPointInPath(x, y);
        }
        else {
            result = this._context.isPointInPath(x, y, fillRule);
        }
        return result;
    };
    GraphicsContext.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
        if (arguments.length === 5) {
            this._context.arc(x, y, radius, startAngle, endAngle);
        }
        else {
            this._context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        }
    };
    GraphicsContext.prototype.arcTo = function (x1, y1, x2, y2, radius) {
        this._context.arcTo(x1, y1, x2, y2, radius);
    };
    GraphicsContext.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
        this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    };
    GraphicsContext.prototype.ellipse = function (x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        if (arguments.length === 7) {
            this._context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle);
        }
        else {
            this._context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
        }
    };
    GraphicsContext.prototype.lineTo = function (x, y) {
        this._context.lineTo(x, y);
    };
    GraphicsContext.prototype.moveTo = function (x, y) {
        this._context.moveTo(x, y);
    };
    GraphicsContext.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
        this._context.quadraticCurveTo(cpx, cpy, x, y);
    };
    GraphicsContext.prototype.rect = function (x, y, w, h) {
        this._context.rect(x, y, w, h);
    };
    GraphicsContext.prototype.clip = function (fillRule) {
        if (arguments.length === 0) {
            this._context.clip();
        }
        else {
            this._context.clip(fillRule);
        }
    };
    GraphicsContext.prototype.fill = function (fillRule) {
        if (arguments.length === 0) {
            this._context.fill();
        }
        else {
            this._context.fill(fillRule);
        }
    };
    GraphicsContext.prototype.stroke = function () {
        this._context.stroke();
    };
    GraphicsContext.prototype.clearRect = function (x, y, w, h) {
        return this._context.clearRect(x, y, w, h);
    };
    GraphicsContext.prototype.fillRect = function (x, y, w, h) {
        this._context.fillRect(x, y, w, h);
    };
    GraphicsContext.prototype.fillText = function (text, x, y, maxWidth) {
        if (arguments.length === 3) {
            this._context.fillText(text, x, y);
        }
        else {
            this._context.fillText(text, x, y, maxWidth);
        }
    };
    GraphicsContext.prototype.strokeRect = function (x, y, w, h) {
        this._context.strokeRect(x, y, w, h);
    };
    GraphicsContext.prototype.strokeText = function (text, x, y, maxWidth) {
        if (arguments.length === 3) {
            this._context.strokeText(text, x, y);
        }
        else {
            this._context.strokeText(text, x, y, maxWidth);
        }
    };
    GraphicsContext.prototype.measureText = function (text) {
        return this._context.measureText(text);
    };
    GraphicsContext.prototype.createLinearGradient = function (x0, y0, x1, y1) {
        return this._context.createLinearGradient(x0, y0, x1, y1);
    };
    GraphicsContext.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
        return this._context.createRadialGradient(x0, y0, r0, x1, y1, r1);
    };
    GraphicsContext.prototype.createPattern = function (image, repetition) {
        return this._context.createPattern(image, repetition);
    };
    GraphicsContext.prototype.createImageData = function () {
        return this._context.createImageData.apply(this._context, arguments);
    };
    GraphicsContext.prototype.getImageData = function (sx, sy, sw, sh) {
        return this._context.getImageData(sx, sy, sw, sh);
    };
    GraphicsContext.prototype.putImageData = function () {
        this._context.putImageData.apply(this._context, arguments);
    };
    GraphicsContext.prototype.drawImage = function () {
        this._context.drawImage.apply(this._context, arguments);
    };
    GraphicsContext.prototype.drawFocusIfNeeded = function (element) {
        this._context.drawFocusIfNeeded(element);
    };
    return GraphicsContext;
}());
exports.GraphicsContext = GraphicsContext;
/**
 * The namespace for the module implementation details.
 */
var Private;
(function (Private) {
    /**
     * The index of next valid pool object.
     */
    var pi = -1;
    /**
     * A state object allocation pool.
     */
    var pool = [];
    /**
     * An object which holds the state for a gc.
     */
    var State = /** @class */ (function () {
        function State() {
        }
        /**
         * Create a gc state object from a 2D canvas context.
         */
        State.create = function (context) {
            var state = pi < 0 ? new State() : pool[pi--];
            state.next = null;
            state.fillStyle = context.fillStyle;
            state.font = context.font;
            state.globalAlpha = context.globalAlpha;
            state.globalCompositeOperation = context.globalCompositeOperation;
            state.imageSmoothingEnabled = context.imageSmoothingEnabled;
            state.lineCap = context.lineCap;
            state.lineDashOffset = context.lineDashOffset;
            state.lineJoin = context.lineJoin;
            state.lineWidth = context.lineWidth;
            state.miterLimit = context.miterLimit;
            state.shadowBlur = context.shadowBlur;
            state.shadowColor = context.shadowColor;
            state.shadowOffsetX = context.shadowOffsetX;
            state.shadowOffsetY = context.shadowOffsetY;
            state.strokeStyle = context.strokeStyle;
            state.textAlign = context.textAlign;
            state.textBaseline = context.textBaseline;
            return state;
        };
        /**
         * Clone an existing gc state object and add it to the state stack.
         */
        State.push = function (other) {
            var state = pi < 0 ? new State() : pool[pi--];
            state.next = other;
            state.fillStyle = other.fillStyle;
            state.font = other.font;
            state.globalAlpha = other.globalAlpha;
            state.globalCompositeOperation = other.globalCompositeOperation;
            state.imageSmoothingEnabled = other.imageSmoothingEnabled;
            state.lineCap = other.lineCap;
            state.lineDashOffset = other.lineDashOffset;
            state.lineJoin = other.lineJoin;
            state.lineWidth = other.lineWidth;
            state.miterLimit = other.miterLimit;
            state.shadowBlur = other.shadowBlur;
            state.shadowColor = other.shadowColor;
            state.shadowOffsetX = other.shadowOffsetX;
            state.shadowOffsetY = other.shadowOffsetY;
            state.strokeStyle = other.strokeStyle;
            state.textAlign = other.textAlign;
            state.textBaseline = other.textBaseline;
            return state;
        };
        /**
         * Pop the next state object and return the current to the pool
         */
        State.pop = function (state) {
            state.fillStyle = '';
            state.strokeStyle = '';
            pool[++pi] = state;
            return state.next;
        };
        return State;
    }());
    Private.State = State;
})(Private || (Private = {}));
