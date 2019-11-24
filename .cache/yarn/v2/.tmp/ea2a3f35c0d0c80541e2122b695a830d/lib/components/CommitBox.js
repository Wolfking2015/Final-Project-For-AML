"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const BranchHeaderStyle_1 = require("../componentsStyle/BranchHeaderStyle");
const typestyle_1 = require("typestyle");
class CommitBox extends React.Component {
    constructor(props) {
        super(props);
        /** Initalize commit message input box */
        this.initializeInput = () => {
            this.setState({
                value: '',
                disableSubmit: true
            });
        };
        /** Handle input inside commit message box */
        this.handleChange = (event) => {
            if (event.target.value && event.target.value !== '') {
                this.setState({
                    value: event.target.value,
                    disableSubmit: false
                });
            }
            else {
                this.setState({
                    value: event.target.value,
                    disableSubmit: true
                });
            }
        };
        this.state = {
            value: '',
            disableSubmit: true
        };
    }
    /** Prevent enter key triggered 'submit' action during commit message input */
    onKeyPress(event) {
        if (event.which === 13) {
            event.preventDefault();
            this.setState({ value: this.state.value + '\n' });
        }
    }
    render() {
        return (React.createElement("form", { className: BranchHeaderStyle_1.stagedCommitStyle, onKeyPress: event => this.onKeyPress(event) },
            React.createElement("textarea", { className: typestyle_1.classes(BranchHeaderStyle_1.textInputStyle, BranchHeaderStyle_1.stagedCommitMessageStyle), disabled: this.props.stagedFiles.length === 0, placeholder: this.props.stagedFiles.length === 0
                    ? 'Stage your changes before commit'
                    : 'Input message to commit staged changes', value: this.state.value, onChange: this.handleChange }),
            React.createElement("input", { className: this.props.checkReadyForSubmit(this.state.disableSubmit, this.props.stagedFiles.length), type: "button", title: "Commit", disabled: this.state.disableSubmit, onClick: () => {
                    this.props.commitAllStagedFiles(this.state.value, this.props.topRepoPath, this.props.refresh),
                        this.initializeInput();
                } })));
    }
}
exports.CommitBox = CommitBox;
