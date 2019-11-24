"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const NewBranchBoxStyle_1 = require("../componentsStyle/NewBranchBoxStyle");
const typestyle_1 = require("typestyle");
class NewBranchBox extends React.Component {
    constructor(props) {
        super(props);
        /** Handle input inside commit message box */
        this.handleChange = (event) => {
            this.setState({
                value: event.target.value
            });
        };
        this.state = {
            value: ''
        };
    }
    /** Prevent enter key triggered 'submit' action during input */
    onKeyPress(event) {
        if (event.which === 13) {
            event.preventDefault();
            this.setState({ value: this.state.value + '\n' });
        }
    }
    render() {
        return (React.createElement("div", { className: NewBranchBoxStyle_1.newBranchInputAreaStyle, onKeyPress: event => this.onKeyPress(event) },
            React.createElement("input", { className: NewBranchBoxStyle_1.newBranchBoxStyle, placeholder: 'New branch', value: this.state.value, onChange: this.handleChange, autoFocus: true }),
            React.createElement("input", { className: typestyle_1.classes(NewBranchBoxStyle_1.buttonStyle, NewBranchBoxStyle_1.newBranchButtonStyle), type: "button", title: "Create New", onClick: () => this.props.createNewBranch(this.state.value) }),
            React.createElement("input", { className: typestyle_1.classes(NewBranchBoxStyle_1.buttonStyle, NewBranchBoxStyle_1.cancelNewBranchButtonStyle), type: "button", title: "Cancel", onClick: () => this.props.toggleNewBranchBox() })));
    }
}
exports.NewBranchBox = NewBranchBox;
