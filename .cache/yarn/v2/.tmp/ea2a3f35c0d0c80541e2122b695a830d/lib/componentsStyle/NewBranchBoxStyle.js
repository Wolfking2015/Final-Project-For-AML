"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typestyle_1 = require("typestyle");
exports.newBranchInputAreaStyle = typestyle_1.style({
    verticalAlign: 'middle'
});
exports.slideAnimation = typestyle_1.keyframes({
    from: {
        width: '0',
        left: '0'
    },
    to: {
        width: '84px',
        left: '0'
    }
});
exports.newBranchBoxStyle = typestyle_1.style({
    width: '84px',
    height: '17px',
    boxSizing: 'border-box',
    margin: '0',
    padding: '2px',
    verticalAlign: 'middle',
    animationDuration: '0.5s',
    animationTimingFunction: 'ease-out',
    animationName: exports.slideAnimation,
    outline: 'none',
    $nest: {
        '&:focus': {
            border: '1px var(--jp-brand-color2) solid'
        }
    }
});
exports.buttonStyle = typestyle_1.style({
    backgroundSize: '100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '17px',
    height: '17px',
    verticalAlign: 'middle',
    outline: 'none',
    border: 'none'
});
exports.newBranchButtonStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-plus-white)',
    backgroundColor: 'var(--jp-brand-color1)'
});
exports.cancelNewBranchButtonStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-clear-white)',
    backgroundColor: 'var(--jp-layout-color4)'
});
