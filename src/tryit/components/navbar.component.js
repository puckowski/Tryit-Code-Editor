import { getState, markup, setState, textNode, version } from '../../../dist/sling.min';
import ExportService from '../services/export.service';
import FileService from '../services/file.service';

class NavbarComponent {

    constructor() {
        this.fileService = new FileService();
        this.exportService = new ExportService();
    }

    addFile() {
        this.fileService.addFile();
    }

    expandHeight() {
        const state = getState();
        let mod = state.getHeightModifier();
        mod += 10;
        state.setHeightModifier(mod);
        setState(state);
    }

    shrinkHeight() {
        const state = getState();
        let mod = state.getHeightModifier();
        mod -= 10;
        state.setHeightModifier(mod);
        setState(state);
    }

    togglePreview() {
        const state = getState();
        state.setShowPreview(!state.getShowPreview());
        setState(state);
    }

    onRun() {
        const state = getState();
        state.getDataSubject().next(true);
    }

    onClearConsole() {
        const consoleEle = document.getElementById('tryit-sling-console');
        if (consoleEle) {
            consoleEle.value = '';
        }
    }

    onExport() {
        const iframeEle = document.getElementById('tryit-sling-iframe');

        if (iframeEle) {
            let text = '';

            if (iframeEle.contentDocument) {
                text = iframeEle.contentDocument.documentElement.outerHTML;
            } else if (iframeEle.contentWindow) {
                text = iframeEle.contentWindow.document.documentElement.outerHTML;
            }

            this.exportService.downloadFile('export.html', text);
        }
    }

    onImport(event) {
        if (event && event.target && event.target.files) {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = (readEvent) => {
                    const state = getState();
                    const fileIndex = state.getEditIndex();
                    this.fileService.updateFileData(fileIndex, readEvent.target.result);
                    state.getDataSubject().next(true);
                };
            }
        }
    }

    view() {
        const state = getState();
        const mod = state.getHeightModifier();
        const collapsedMode = state.getCollapsedMode();
        const versionStr = state.getVersion();

        return markup('div', {
            attrs: {
                style: 'padding: 0.5rem; background-color: rgb(46, 49, 56); display: flex; flex-direction: row; flex-wrap: wrap;'
            },
            children: [
                markup('div', {
                    attrs: {
                        style: 'margin-right: 0.5rem; display: inline-block; color: rgb(204, 204, 204); align-self: center;'
                    },
                    children: [
                        markup('h4', {
                            attrs: {
                                style: 'margin: 0px; display: inline-block; margin-right: 0.25rem;'
                            },
                            children: [
                                textNode('Code Editor')
                            ]
                        }),
                        markup('span', {
                            children: [
                                textNode(versionStr)
                            ]
                        })
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.addFile.bind(this),
                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; font: 400 13.3333px Arial; padding: 1px 6px;'
                    },
                    children: [
                        textNode('Add File')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.expandHeight.bind(this),
                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; font: 400 13.3333px Arial; padding: 1px 6px;'
                    },
                    children: [
                        textNode('Expand')
                    ]
                }),
                ...(mod > 0 ? [
                    markup('button', {
                        attrs: {
                            onclick: this.shrinkHeight.bind(this),
                            style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; font: 400 13.3333px Arial; padding: 1px 6px;'
                        },
                        children: [
                            textNode('Shrink')
                        ]
                    })
                ] : []),
                markup('button', {
                    attrs: {
                        onclick: this.onRun.bind(this),
                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; font: 400 13.3333px Arial; padding: 1px 6px;'
                    },
                    children: [
                        textNode('Run')
                    ]
                }),
                ...(collapsedMode === true ? [
                    markup('button', {
                        attrs: {
                            onclick: this.togglePreview.bind(this),
                            style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; font: 400 13.3333px Arial; padding: 1px 6px;'
                        },
                        children: [
                            textNode('Toggle Preview')
                        ]
                    })
                ] : []),
                markup('button', {
                    attrs: {
                        onclick: this.onExport.bind(this),
                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; font: 400 13.3333px Arial; padding: 1px 6px;'
                    },
                    children: [
                        textNode('Export')
                    ]
                }),
                markup('label', {
                    attrs: {
                        id: 'try-sling-import-label',
                        for: 'tryit-sling-import',
                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; font: 400 13.3333px Arial; padding: 1px 6px;',
                    },
                    children: [
                        textNode('Import')
                    ]
                }),
                markup('input', {
                    attrs: {
                        onchange: this.onImport.bind(this),
                        id: 'tryit-sling-import',
                        type: 'file',
                        style: 'display: none;'
                    }
                }),
                markup('button', {
                    attrs: {
                        id: 'tryit-sling-clear-console',
                        onclick: this.onClearConsole.bind(this),
                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); align-self: center; font: 400 13.3333px Arial; padding: 1px 6px;'
                    },
                    children: [
                        textNode('Clear Console')
                    ]
                })
            ]
        });
    }
}

export default NavbarComponent;
