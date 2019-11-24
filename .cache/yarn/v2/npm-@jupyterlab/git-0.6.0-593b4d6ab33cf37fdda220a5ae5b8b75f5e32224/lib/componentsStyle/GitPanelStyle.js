"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typestyle_1 = require("typestyle");
exports.panelContainerStyle = typestyle_1.style({
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    height: '100%'
});
exports.panelWarningStyle = typestyle_1.style({
    textAlign: 'center',
    marginTop: '9px'
});
exports.findRepoButtonStyle = typestyle_1.style({
    color: 'white',
    backgroundColor: 'var(--jp-brand-color1)',
    marginTop: '5px'
});
