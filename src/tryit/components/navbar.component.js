import { detectChanges, getState, markup, setState, textNode, version } from '../../../dist/sling.min';
import ExportService from '../services/export.service';
import FileService from '../services/file.service';
import { SCRIPT_VALIDITY_CHECK_SOURCE } from '../stores/global.store';
import { js_beautify } from '../../../js/beautify';
import { css_beautify } from '../../../js/beautify-css';
import { html_beautify } from '../../../js/beautify-html';

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

        s.DETACHED_SET_TIMEOUT(() => {
            state.getDataSubject().next(true);
        }, 0);

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
                const scriptList = iframeEle.contentDocument.head.querySelectorAll('script');
                for (let i = 0; i < scriptList.length; ++i) {
                    if (scriptList[i].hasAttribute('tryit-sling-script')) {
                        iframeEle.contentDocument.head.removeChild(scriptList[i]);
                    }
                }
                text = iframeEle.contentDocument.documentElement.outerHTML;
            } else if (iframeEle.contentWindow) {
                const scriptList = iframeEle.contentWindow.document.head.querySelectorAll('script');
                for (let i = 0; i < scriptList.length; ++i) {
                    if (scriptList[i].hasAttribute('tryit-sling-script')) {
                        iframeEle.contentWindow.document.head.removeChild(scriptList[i]);
                    }
                }
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
                    if (file.name.toLowerCase().includes('.js')) {
                        this.fileService.addFile(readEvent.target.result, true, false);
                    } else if (file.name.toLowerCase().includes('.css')) {
                        this.fileService.addFile(readEvent.target.result, false, true);
                    } else if (file.name.toLowerCase().includes('.html')) {
                        this.fileService.addFile(readEvent.target.result, false, false);
                    } else {
                        this.fileService.addFile(readEvent.target.result, false, false);
                    }
                    state.getDataSubject().next(true);
                };
            }
        }

        if (event && event.target) {
            event.target.value = '';
        }
    }

    removeLastOccurrence(textToReplace, str) {
        const charpos = str.lastIndexOf(textToReplace);

        if (charpos < 0) {
            return str;
        }

        const ptone = str.substring(0, charpos);
        const pttwo = str.substring(charpos + textToReplace.length);

        return (ptone + pttwo);
    }

    onImportWorkspace(event) {
        if (event && event.target && event.target.files) {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = (readEvent) => {
                    const iframeEle = document.createElement('iframe');
                    iframeEle.style.visibility = 'hidden';
                    document.body.appendChild(iframeEle);

                    const htmlContainer = (iframeEle.contentWindow) ? iframeEle.contentWindow : (iframeEle.contentDocument.document) ? iframeEle.contentDocument.document : iframeEle.contentDocument;
                    htmlContainer.document.open();
                    htmlContainer.document.write(readEvent.target.result);

                    htmlContainer.document.close();

                    if (iframeEle.contentDocument) {
                        const scriptList = iframeEle.contentDocument.head.querySelectorAll('script');
                        for (let i = 0; i < scriptList.length; ++i) {
                            let scriptText = scriptList[i].textContent;
                            scriptText = this.removeLastOccurrence(SCRIPT_VALIDITY_CHECK_SOURCE, scriptText);

                            this.fileService.addFile(scriptText, true, false);
                        }
                        for (let i = 0; i < scriptList.length; ++i) {
                            iframeEle.contentDocument.head.removeChild(scriptList[i]);
                        }

                        const styleList = iframeEle.contentDocument.head.querySelectorAll('style');
                        for (let i = 0; i < styleList.length; ++i) {
                            this.fileService.addFile(styleList[i].textContent, false, true);
                        }
                        for (let i = 0; i < styleList.length; ++i) {
                            iframeEle.contentDocument.head.removeChild(styleList[i]);
                        }

                        const text = iframeEle.contentDocument.documentElement.outerHTML;
                        this.fileService.addFile(text);
                    } else if (iframeEle.contentWindow) {
                        const scriptList = iframeEle.contentWindow.document.head.querySelectorAll('script');
                        for (let i = 0; i < scriptList.length; ++i) {
                            let scriptText = scriptList[i].textContent;
                            scriptText = this.removeLastOccurrence(SCRIPT_VALIDITY_CHECK_SOURCE, scriptText);

                            this.fileService.addFile(scriptText, true, false);
                        }
                        for (let i = 0; i < scriptList.length; ++i) {
                            iframeEle.contentWindow.document.head.removeChild(scriptList[i]);
                        }

                        const styleList = iframeEle.contentDocument.head.querySelectorAll('style');
                        for (let i = 0; i < styleList.length; ++i) {
                            this.fileService.addFile(styleList[i].textContent, false, true);
                        }
                        for (let i = 0; i < scriptList.length; ++i) {
                            iframeEle.contentWindow.document.head.removeChild(styleList[i]);
                        }

                        const text = iframeEle.contentWindow.document.documentElement.outerHTML;
                        this.fileService.addFile(text);
                    }

                    document.body.removeChild(iframeEle);

                    const state = getState();
                    state.getDataSubject().next(true);
                    detectChanges();
                };
            }
        }

        if (event && event.target) {
            event.target.value = '';
        }
    }

    onHelpToggle() {
        const state = getState();
        state.setShowHelp(!state.getShowHelp());
        setState(state);

        if (!state.getShowHelp()) {
            s.DETACHED_SET_TIMEOUT(() => {
                state.getDataSubject().next(true);
            }, 0);
        }
    }

    onSlingDemo() {
        const startIndex = this.fileService.buildSlingDemo();
        const state = getState();
        state.setEditIndex(startIndex);
        setState(state);
        s.DETACHED_SET_TIMEOUT(() => {
            state.getDataSubject().next(true);
        }, 0);
    }

    onBeautify() {
        const state = getState();
        const fileIndex = state.getEditIndex();
        const fileData = this.fileService.getFile(fileIndex);
        let code = this.fileService.getFileData(fileIndex);

        if (fileData.injectCss) {
            code = css_beautify(code);
        } else if (fileData.injectScript) {
            code = js_beautify(code);
        } else {
            code = html_beautify(code);
        }

        this.fileService.updateFileData(fileIndex, code);

        const sub = state.getDataSubject();
        sub.next(true);
    }

    onToggleMode() {
        const state = getState();

        if (state.getCollapsedMode()) {
            state.setCollapsedMode(false);
            state.setPortraitMode(true);
        } else if (state.getPortraitMode()) {
            state.setCollapsedMode(false);
            state.setPortraitMode(false);
        } else {
            state.setCollapsedMode(true);
        }

        s.DETACHED_SET_TIMEOUT(() => {
            state.getDataSubject().next(true);
        }, 0);
        
        setState(state);
        detectChanges();
    }

    view() {
        const state = getState();
        const mod = state.getHeightModifier();
        const collapsedMode = state.getCollapsedMode();
        const versionStr = state.getVersion();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 26px Arial;';
        }

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
                                style: 'margin: 0px; display: inline-block; margin-right: 0.25rem;' + font
                            },
                            children: [
                                textNode('Code Editor')
                            ]
                        }),
                        markup('span', {
                            attrs: {
                                style: font
                            },
                            children: [
                                textNode(versionStr)
                            ]
                        })
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.addFile.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font
                    },
                    children: [
                        textNode('Add File')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.expandHeight.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font
                    },
                    children: [
                        textNode('Expand')
                    ]
                }),
                ...(mod > 0 ? [
                    markup('button', {
                        attrs: {
                            onclick: this.shrinkHeight.bind(this),
                            style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font
                        },
                        children: [
                            textNode('Shrink')
                        ]
                    })
                ] : []),
                markup('button', {
                    attrs: {
                        onclick: this.onRun.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font
                    },
                    children: [
                        textNode('Run')
                    ]
                }),
                ...(collapsedMode === true ? [
                    markup('button', {
                        attrs: {
                            onclick: this.togglePreview.bind(this),
                            style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font
                        },
                        children: [
                            textNode('Toggle Preview')
                        ]
                    })
                ] : []),
                markup('button', {
                    attrs: {
                        onclick: this.onExport.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font
                    },
                    children: [
                        textNode('Export')
                    ]
                }),
                markup('label', {
                    attrs: {
                        id: 'try-sling-import-label',
                        for: 'tryit-sling-import',
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font,
                    },
                    children: [
                        textNode('Import File')
                    ]
                }),
                markup('label', {
                    attrs: {
                        id: 'try-sling-import-workspace-label',
                        for: 'tryit-sling-import-workspace',
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font,
                    },
                    children: [
                        textNode('Import Workspace')
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
                markup('input', {
                    attrs: {
                        onchange: this.onImportWorkspace.bind(this),
                        id: 'tryit-sling-import-workspace',
                        type: 'file',
                        style: 'display: none;'
                    }
                }),
                markup('button', {
                    attrs: {
                        onclick: this.onHelpToggle.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font
                    },
                    children: [
                        textNode('Toggle Help')
                    ]
                }),
                markup('button', {
                    attrs: {
                        id: 'tryit-sling-clear-console',
                        onclick: this.onClearConsole.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font
                    },
                    children: [
                        textNode('Clear Console')
                    ]
                }),
                markup('button', {
                    attrs: {
                        id: 'tryit-sling-beautify',
                        onclick: this.onBeautify.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font
                    },
                    children: [
                        textNode('Format Code')
                    ]
                }),
                markup('button', {
                    attrs: {
                        id: 'tryit-sling-toggle-mode',
                        onclick: this.onToggleMode.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center; padding: 1px 6px;' + font
                    },
                    children: [
                        textNode('Toggle Mode')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.onSlingDemo.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); align-self: center; padding: 1px 6px;' + font
                    },
                    children: [
                        textNode('Sling.js Demo')
                    ]
                })
            ]
        });
    }
}

export default NavbarComponent;
