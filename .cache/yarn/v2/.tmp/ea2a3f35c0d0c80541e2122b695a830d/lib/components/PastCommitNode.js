"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const typestyle_1 = require("typestyle");
const PastCommitNodeStyle_1 = require("../componentsStyle/PastCommitNodeStyle");
const SinglePastCommitInfo_1 = require("./SinglePastCommitInfo");
class PastCommitNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false
        };
    }
    getBranchesForCommit() {
        const currentCommit = this.props.pastCommit.commit;
        const branches = [];
        for (let i = 0; i < this.props.branches.length; i++) {
            const branch = this.props.branches[i];
            if (branch.top_commit && branch.top_commit === currentCommit) {
                branches.push(branch);
            }
        }
        return branches;
    }
    expand() {
        this.setState(() => ({ expanded: true }));
    }
    collapse() {
        this.setState(() => ({ expanded: false }));
    }
    getNodeClass() {
        if (this.state.expanded) {
            return typestyle_1.classes(PastCommitNodeStyle_1.pastCommitNodeStyle, PastCommitNodeStyle_1.pastCommitExpandedStyle);
        }
        return PastCommitNodeStyle_1.pastCommitNodeStyle;
    }
    render() {
        return (React.createElement("div", { onClick: () => {
                // tslint:disable-next-line: no-unused-expression
                !this.state.expanded && this.expand();
            }, className: this.getNodeClass() },
            React.createElement("div", { className: PastCommitNodeStyle_1.pastCommitHeaderStyle },
                React.createElement("div", { className: PastCommitNodeStyle_1.pastCommitHeaderItemStyle }, this.props.pastCommit.author),
                React.createElement("div", { className: PastCommitNodeStyle_1.pastCommitHeaderItemStyle }, this.props.pastCommit.commit.slice(0, 7)),
                React.createElement("div", { className: PastCommitNodeStyle_1.pastCommitHeaderItemStyle }, this.props.pastCommit.date)),
            React.createElement("div", { className: PastCommitNodeStyle_1.branchesStyle }, this.getBranchesForCommit().map((branch, id) => (React.createElement(React.Fragment, { key: id },
                branch.is_current_branch && (React.createElement("span", { className: typestyle_1.classes(PastCommitNodeStyle_1.branchStyle, PastCommitNodeStyle_1.workingBranchStyle) }, "working")),
                React.createElement("span", { className: typestyle_1.classes(PastCommitNodeStyle_1.branchStyle, branch.is_remote_branch ? PastCommitNodeStyle_1.remoteBranchStyle : PastCommitNodeStyle_1.localBranchStyle) }, branch.name))))),
            React.createElement("div", { className: PastCommitNodeStyle_1.pastCommitBodyStyle },
                this.props.pastCommit.commit_msg,
                this.state.expanded && (React.createElement(React.Fragment, null,
                    React.createElement(SinglePastCommitInfo_1.SinglePastCommitInfo, { data: this.props.pastCommit, topRepoPath: this.props.topRepoPath, app: this.props.app, diff: this.props.diff, refresh: this.props.refresh }),
                    React.createElement("div", { className: PastCommitNodeStyle_1.collapseStyle, onClick: () => this.collapse() }, "Collapse"))))));
    }
}
exports.PastCommitNode = PastCommitNode;
