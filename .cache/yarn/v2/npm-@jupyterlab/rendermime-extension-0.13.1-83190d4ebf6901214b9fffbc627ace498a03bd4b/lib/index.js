"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const docmanager_1 = require("@jupyterlab/docmanager");
const rendermime_1 = require("@jupyterlab/rendermime");
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.handleLink = 'rendermime:handle-local-link';
})(CommandIDs || (CommandIDs = {}));
/**
 * A plugin providing a rendermime registry.
 */
const plugin = {
    id: '@jupyterlab/rendermime-extension:plugin',
    requires: [docmanager_1.IDocumentManager],
    optional: [rendermime_1.ILatexTypesetter],
    provides: rendermime_1.IRenderMimeRegistry,
    activate: activate,
    autoStart: true
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
/**
 * Activate the rendermine plugin.
 */
function activate(app, docManager, latexTypesetter) {
    app.commands.addCommand(CommandIDs.handleLink, {
        label: 'Handle Local Link',
        execute: args => {
            const path = args['path'];
            const id = args['id'];
            if (!path) {
                return;
            }
            // First check if the path exists on the server.
            return docManager.services.contents
                .get(path, { content: false })
                .then(() => {
                // Open the link with the default rendered widget factory,
                // if applicable.
                const factory = docManager.registry.defaultRenderedWidgetFactory(path);
                const widget = docManager.openOrReveal(path, factory.name);
                if (!widget) {
                    return;
                }
                return widget.revealed.then(() => {
                    // Once the widget is ready, attempt to scroll the hash into view
                    // if one has been provided.
                    if (!id) {
                        return;
                    }
                    // Look for the an element with the hash id in the document.
                    // This id is set automatically for headers tags when
                    // we render markdown.
                    const element = widget.node.querySelector(id);
                    if (element) {
                        element.scrollIntoView();
                    }
                    return;
                });
            });
        }
    });
    return new rendermime_1.RenderMimeRegistry({
        initialFactories: rendermime_1.standardRendererFactories,
        linkHandler: {
            handleLink: (node, path, id) => {
                app.commandLinker.connectNode(node, CommandIDs.handleLink, {
                    path,
                    id
                });
            }
        },
        latexTypesetter
    });
}
