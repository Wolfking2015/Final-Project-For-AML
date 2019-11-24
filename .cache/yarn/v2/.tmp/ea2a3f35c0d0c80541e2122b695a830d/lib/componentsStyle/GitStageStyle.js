"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typestyle_1 = require("typestyle");
exports.sectionFileContainerStyle = typestyle_1.style({
    flex: '1 1 auto',
    margin: '0',
    padding: '0',
    overflow: 'auto',
    $nest: {
        '& button:disabled': {
            opacity: 0.5
        }
    }
});
exports.sectionFileContainerDisabledStyle = typestyle_1.style({
    opacity: 0.5
});
exports.sectionAreaStyle = typestyle_1.style({
    flex: '0 0 auto',
    margin: '4px 0px',
    padding: '4px 1px 4px 4px',
    fontWeight: 600,
    borderBottom: 'var(--jp-border-width) solid var(--jp-border-color2)',
    letterSpacing: '1px',
    fontSize: '12px'
});
exports.sectionHeaderLabelStyle = typestyle_1.style({
    fontSize: 'var(--jp-ui-font-size)',
    flex: '1 1 auto',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    borderRadius: '2px',
    transition: 'background-color 0.1s ease',
    $nest: {
        '&:hover': {
            backgroundColor: '0'
        },
        '&:focus': {
            backgroundColor: '0'
        }
    }
});
exports.changeStageButtonStyle = typestyle_1.style({
    margin: '0px 2px',
    fontWeight: 600,
    backgroundColor: 'transparent',
    lineHeight: 'var(--jp-private-running-shutdown-button-height)',
    transition: 'background-color 0.1s ease',
    borderRadius: '2px',
    height: '12px',
    width: '12px',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    border: 'none',
    outline: 'none',
    $nest: {
        '&:hover': {
            backgroundColor: 'none',
            outline: 'none'
        },
        '&:focus': {
            border: 'none',
            boxShadow: 'none',
            backgroundColor: 'none'
        }
    }
});
exports.discardFileButtonStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-discard-file)',
    marginLeft: '6px',
    backgroundSize: '120%'
});
exports.discardAllWarningStyle = typestyle_1.style({
    height: '40px !important',
    $nest: {
        '& button': {
            marginTop: '5px'
        }
    }
});
exports.caretdownImageStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-image-caretdown)'
});
exports.caretrightImageStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-image-caretright)'
});
exports.changeStageButtonLeftStyle = typestyle_1.style({
    float: 'left'
});
