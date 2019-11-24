"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typestyle_1 = require("typestyle");
exports.branchStyle = typestyle_1.style({
    zIndex: 1,
    textAlign: 'center',
    overflowY: 'auto'
});
exports.selectedHeaderStyle = typestyle_1.style({
    borderTop: 'var(--jp-border-width) solid var(--jp-border-color2)',
    paddingBottom: 'var(--jp-border-width)'
});
exports.unSelectedHeaderStyle = typestyle_1.style({
    backgroundColor: 'var(--jp-layout-color2)',
    borderBottom: 'var(--jp-border-width) solid var(--jp-border-color2)',
    paddingTop: 'var(--jp-border-width)'
});
exports.smallBranchStyle = typestyle_1.style({
    height: '35px'
});
exports.expandedBranchStyle = typestyle_1.style({
    height: '500px'
});
exports.openHistorySideBarButtonStyle = typestyle_1.style({
    width: '50px',
    flex: 'initial',
    paddingLeft: '10px',
    paddingRight: '10px',
    borderRight: 'var(--jp-border-width) solid var(--jp-border-color2)'
});
exports.historyLabelStyle = typestyle_1.style({
    fontSize: 'var(--jp-ui-font-size1)',
    marginTop: '5px',
    marginBottom: '5px',
    display: 'inline-block',
    fontWeight: 'normal'
});
exports.branchLabelStyle = typestyle_1.style({
    fontSize: 'var(--jp-ui-font-size1)',
    marginTop: '5px',
    marginBottom: '5px',
    display: 'inline-block'
});
exports.branchTrackingLabelStyle = typestyle_1.style({
    fontSize: 'var(--jp-ui-font-size1)',
    marginTop: '5px',
    marginBottom: '5px',
    display: 'inline-block',
    color: 'var(--jp-ui-font-color2)',
    fontWeight: 'normal'
});
exports.branchIconStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-Git-icon-branch)',
    display: 'inline-block',
    height: '14px',
    width: '14px',
    margin: '6px 10px -2px 0px',
    backgroundRepeat: 'no-repeat'
});
exports.branchDropdownStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-image-caretdownwhite)',
    backgroundColor: 'transparent',
    flex: '0 0 auto',
    verticalAlign: 'middle',
    border: 'var(--md-grey-700)',
    borderRadius: '0',
    outline: 'none',
    width: '11px',
    height: '11px',
    marginTop: '8px',
    marginBottom: '2px',
    textIndent: '20px',
    '-webkit-appearance': 'none',
    '-moz-appearance': 'none'
});
exports.headerButtonStyle = typestyle_1.style({
    color: 'var(--jp-content-link-color)',
    fontSize: '10px',
    marginLeft: '5px'
});
exports.branchDropdownButtonStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-arrow-down)',
    backgroundSize: '100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    height: '18px',
    width: '18px',
    display: 'inline-block',
    verticalAlign: 'middle'
});
exports.newBranchButtonStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-plus)',
    backgroundSize: '100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    height: '18px',
    width: '18px',
    display: 'inline-block',
    verticalAlign: 'middle'
});
exports.branchTrackingIconStyle = typestyle_1.style({
    backgroundImage: 'var(--jp-icon-branch-tracking)',
    backgroundSize: '70%',
    backgroundRepeat: 'no-repeat',
    height: '18px',
    width: '18px',
    display: 'inline-block',
    verticalAlign: 'middle',
    marginTop: '8px',
    marginLeft: '10px'
});
exports.headerButtonDisabledStyle = typestyle_1.style({
    opacity: 0.5
});
exports.branchListItemStyle = typestyle_1.style({
    listStyle: 'none',
    color: 'var(--jp-ui-font-color1)'
});
exports.stagedCommitButtonStyle = typestyle_1.style({
    backgroundColor: 'var(--jp-brand-color1)',
    backgroundImage: 'var(--jp-checkmark)',
    backgroundSize: '100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    color: 'white',
    height: '42px',
    width: '40px',
    border: '0',
    flex: '1 1 auto'
});
exports.stagedCommitButtonReadyStyle = typestyle_1.style({
    opacity: 0.3
});
exports.stagedCommitButtonDisabledStyle = typestyle_1.style({
    backgroundColor: 'lightgray'
});
exports.textInputStyle = typestyle_1.style({
    outline: 'none'
});
exports.stagedCommitStyle = typestyle_1.style({
    resize: 'none',
    display: 'flex',
    alignItems: 'center',
    margin: '8px'
});
exports.stagedCommitMessageStyle = typestyle_1.style({
    width: '75%',
    fontWeight: 300,
    height: '32px',
    overflowX: 'auto',
    border: 'var(--jp-border-width) solid var(--jp-border-color2)',
    flex: '20 1 auto',
    resize: 'none',
    padding: '4px 8px',
    backgroundColor: 'var(--jp-layout-color1)',
    color: 'var(--jp-ui-font-color0)',
    $nest: {
        '&:focus': {
            outline: 'none'
        },
        '&::-webkit-input-placeholder': {
            color: 'var(--jp-ui-font-color3)'
        },
        '&::-moz-placeholder': {
            color: 'var(--jp-ui-font-color3)'
        },
        '&::-ms-input-placeholder': {
            color: 'var(--jp-ui-font-color3)'
        }
    }
});
exports.branchHeaderCenterContent = typestyle_1.style({
    paddingLeft: '5px',
    paddingRight: '5px',
    flex: 'auto'
});
