"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typestyle_1 = require("typestyle");
exports.fileStyle = typestyle_1.style({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    color: 'var(--jp-ui-font-color1)',
    height: '25px',
    lineHeight: 'var(--jp-private-running-item-height)',
    paddingLeft: '4px',
    listStyleType: 'none',
    $nest: {
        '&:hover': {
            backgroundColor: 'rgba(153,153,153,.1)'
        },
        '&:hover .jp-Git-button': {
            visibility: 'visible'
        }
    }
});
exports.selectedFileStyle = typestyle_1.style({
    color: 'white',
    background: 'var(--jp-brand-color1)',
    $nest: {
        '&:hover': {
            color: 'white',
            background: 'var(--jp-brand-color1) !important'
        }
    }
});
exports.expandedFileStyle = typestyle_1.style({
    height: '75px'
});
exports.disabledFileStyle = typestyle_1.style({
    opacity: 0.5
});
exports.fileIconStyle = typestyle_1.style({
    flex: '0 0 auto',
    padding: '0px 8px',
    marginRight: '4px',
    verticalAlign: 'baseline',
    backgroundSize: '16px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
});
exports.fileLabelStyle = typestyle_1.style({
    fontSize: 'var(--jp-ui-font-size1)',
    flex: '1 1 auto',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    borderRadius: '2px',
    transition: 'background-color 0.1s ease',
    $nest: {
        '&:focus': {
            backgroundColor: 'var(--jp-layout-color3)'
        }
    }
});
exports.fileChangedLabelStyle = typestyle_1.style({
    fontSize: '10px',
    marginLeft: '5px'
});
exports.selectedFileChangedLabelStyle = typestyle_1.style({
    color: 'white !important'
});
exports.fileChangedLabelBrandStyle = typestyle_1.style({
    color: 'var(--jp-brand-color0)'
});
exports.fileChangedLabelInfoStyle = typestyle_1.style({
    color: 'var(--jp-info-color0)'
});
exports.discardWarningStyle = typestyle_1.style({
    color: 'var(--jp-ui-font-color1)',
    marginLeft: '20px',
    height: '50px'
});
exports.fileGitButtonStyle = typestyle_1.style({
    visibility: 'hidden',
    display: 'inline'
});
exports.fileButtonStyle = typestyle_1.style({
    marginTop: '5px'
});
exports.discardButtonStyle = typestyle_1.style({
    color: 'white'
});
exports.discardFileButtonSelectedStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-discard-file-selected)',
    marginLeft: '6px',
    backgroundSize: '120%'
});
exports.cancelDiscardButtonStyle = typestyle_1.style({
    backgroundColor: 'var(--jp-border-color0)',
    border: 'none'
});
exports.acceptDiscardButtonStyle = typestyle_1.style({
    backgroundColor: 'var(--jp-error-color0)',
    border: 'none',
    marginLeft: '5px'
});
exports.sideBarExpandedFileLabelStyle = typestyle_1.style({
    maxWidth: '75%'
});
