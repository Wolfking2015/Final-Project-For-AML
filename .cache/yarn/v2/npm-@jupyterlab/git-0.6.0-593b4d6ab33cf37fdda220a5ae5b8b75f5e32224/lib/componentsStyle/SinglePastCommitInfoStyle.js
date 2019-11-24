"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typestyle_1 = require("typestyle");
exports.commitStyle = typestyle_1.style({
    flex: '0 0 auto',
    width: '100%',
    fontSize: '12px',
    marginBottom: '10px',
    marginTop: '5px'
});
exports.headerStyle = typestyle_1.style({
    backgroundColor: 'var(--md-green-500)',
    color: 'white',
    display: 'inline-block',
    width: '100%',
    height: '30px'
});
exports.floatRightStyle = typestyle_1.style({
    float: 'right'
});
exports.commitOverviewNumbers = typestyle_1.style({
    fontSize: '13px',
    fontWeight: 'bold',
    paddingTop: '5px',
    $nest: {
        '& span': {
            marginLeft: '5px'
        },
        '& span:nth-of-type(1)': {
            marginLeft: '0px'
        }
    }
});
exports.commitDetailStyle = typestyle_1.style({
    flex: '1 1 auto',
    margin: '0',
    overflow: 'auto'
});
exports.commitDetailHeader = typestyle_1.style({
    fontSize: '13px',
    fontWeight: 'bold'
});
exports.commitDetailFileStyle = typestyle_1.style({
    display: 'flex',
    flexDirection: 'row',
    color: 'var(--jp-ui-font-color1)',
    height: 'var(--jp-private-running-item-height)',
    lineHeight: 'var(--jp-private-running-item-height)',
    whiteSpace: 'nowrap'
});
exports.commitDetailFilePathStyle = typestyle_1.style({
    fontSize: 'var(--jp-ui-font-size1)',
    flex: '1 1 auto',
    marginRight: '4px',
    paddingLeft: '4px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    borderRadius: '2px',
    transition: 'background-color 0.1s ease'
});
exports.iconStyle = typestyle_1.style({
    display: 'inline-block',
    width: '20px',
    height: '13px',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '15px',
    right: '10px'
});
exports.numberofChangedFilesStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-file)'
});
exports.insertionIconStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-insertions-made)'
});
exports.deletionIconStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-deletions-made)'
});
exports.revertButtonStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-rewind)',
    marginLeft: '6px',
    backgroundSize: '100%'
});
exports.numberOfDeletionsStyle = typestyle_1.style({
    position: 'absolute',
    right: '12px',
    width: '15px',
    marginTop: '1px'
});
exports.numberOfInsertionsStyle = typestyle_1.style({
    position: 'absolute',
    right: '50px',
    width: '15px',
    marginTop: '1px'
});
exports.warningLabel = typestyle_1.style({
    padding: '5px 1px 5px 0'
});
exports.messageInput = typestyle_1.style({
    boxSizing: 'border-box',
    width: '95%',
    marginBottom: '7px'
});
exports.button = typestyle_1.style({
    outline: 'none',
    border: 'none',
    color: 'var(--jp-layout-color0)'
});
exports.resetDeleteDisabledButton = typestyle_1.style({
    backgroundColor: 'var(--jp-error-color2)'
});
exports.resetDeleteButton = typestyle_1.style({
    backgroundColor: 'var(--jp-error-color1)'
});
exports.cancelButton = typestyle_1.style({
    backgroundColor: 'var(--jp-layout-color4)',
    marginRight: '4px'
});
