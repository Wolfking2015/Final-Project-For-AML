"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typestyle_1 = require("typestyle");
exports.repoStyle = typestyle_1.style({
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'var(--jp-layout-color1)',
    lineHeight: 'var(--jp-private-running-item-height)',
    minHeight: '35px'
});
exports.repoPathStyle = typestyle_1.style({
    fontSize: 'var(--jp-ui-font-size1)',
    marginRight: '4px',
    paddingLeft: '4px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    lineHeight: '33px'
});
exports.repoRefreshStyle = typestyle_1.style({
    width: 'var(--jp-private-running-button-width)',
    background: 'var(--jp-layout-color1)',
    border: 'none',
    backgroundImage: 'var(--jp-icon-refresh)',
    backgroundSize: '16px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    boxSizing: 'border-box',
    outline: 'none',
    padding: '0px 6px',
    margin: 'auto 5px auto auto',
    height: '24px',
    $nest: {
        '&:hover': {
            backgroundColor: 'var(--jp-layout-color2)'
        },
        '&:active': {
            backgroundColor: 'var(--jp-layout-color3)'
        }
    }
});
exports.gitPushStyle = typestyle_1.style({
    width: 'var(--jp-private-running-button-width)',
    background: 'var(--jp-layout-color1)',
    border: 'none',
    backgroundImage: 'var(--jp-icon-git-push)',
    backgroundSize: '16px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    boxSizing: 'border-box',
    outline: 'none',
    padding: '0px 6px',
    margin: 'auto 5px auto auto',
    height: '24px',
    $nest: {
        '&:hover': {
            backgroundColor: 'var(--jp-layout-color2)'
        },
        '&:active': {
            backgroundColor: 'var(--jp-layout-color3)'
        }
    }
});
exports.gitPullStyle = typestyle_1.style({
    width: 'var(--jp-private-running-button-width)',
    background: 'var(--jp-layout-color1)',
    border: 'none',
    backgroundImage: 'var(--jp-icon-git-pull)',
    backgroundSize: '16px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    boxSizing: 'border-box',
    outline: 'none',
    padding: '0px 6px',
    margin: 'auto 5px auto auto',
    height: '24px',
    $nest: {
        '&:hover': {
            backgroundColor: 'var(--jp-layout-color2)'
        },
        '&:active': {
            backgroundColor: 'var(--jp-layout-color3)'
        }
    }
});
