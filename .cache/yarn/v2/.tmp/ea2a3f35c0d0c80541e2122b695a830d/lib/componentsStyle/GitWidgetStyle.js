"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typestyle_1 = require("typestyle");
exports.gitWidgetStyle = typestyle_1.style({
    display: 'flex',
    flexDirection: 'column',
    minWidth: '300px',
    color: 'var(--jp-ui-font-color1)',
    background: 'var(--jp-layout-color1)',
    fontSize: 'var(--jp-ui-font-size0)'
});
exports.gitTabStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-git)'
});
