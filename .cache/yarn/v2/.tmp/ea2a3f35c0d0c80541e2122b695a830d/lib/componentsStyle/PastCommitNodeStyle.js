"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typestyle_1 = require("typestyle");
exports.pastCommitNodeStyle = typestyle_1.style({
    flexGrow: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    borderBottom: 'var(--jp-border-width) solid var(--jp-border-color2)'
});
exports.pastCommitHeaderStyle = typestyle_1.style({
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--jp-ui-font-color2)',
    paddingBottom: '5px'
});
exports.branchesStyle = typestyle_1.style({
    display: 'flex',
    fontSize: '0.8em',
    marginLeft: '-5px'
});
exports.branchStyle = typestyle_1.style({
    padding: '2px',
    // Special case as black, regardless of theme, because
    // backgrounds of colors are not based on theme either
    color: '#000000de',
    border: 'var(--jp-border-width) solid #424242',
    borderRadius: '4px',
    margin: '3px'
});
exports.remoteBranchStyle = typestyle_1.style({
    backgroundColor: '#ffcdd3'
});
exports.localBranchStyle = typestyle_1.style({
    backgroundColor: '#b2ebf3'
});
exports.workingBranchStyle = typestyle_1.style({
    backgroundColor: '#ffce83'
});
exports.pastCommitExpandedStyle = typestyle_1.style({
    backgroundColor: '#f9f9f9'
});
exports.pastCommitHeaderItemStyle = typestyle_1.style({});
exports.collapseStyle = typestyle_1.style({
    color: '#1a76d2',
    float: 'right'
});
exports.pastCommitBodyStyle = typestyle_1.style({
    flex: 'auto'
});
