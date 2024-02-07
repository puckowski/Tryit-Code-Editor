import { detectChanges, getState, markup, setState, textNode, mount } from '../../../dist/sling.min';
import ExportService from '../services/export.service';
import FileService from '../services/file.service';
import { SCRIPT_VALIDITY_CHECK_SOURCE } from '../stores/global.store';
import { js_beautify } from '../../../js/beautify';
import { css_beautify } from '../../../js/beautify-css';
import { html_beautify } from '../../../js/beautify-html';
import ShareDialogComponent from './share-dialog.component';
import pako from '../../../js/pako.min';

class NavbarComponent {

    constructor() {
        this.fileService = new FileService();
        this.exportService = new ExportService();
        this.CSS_MODE_NESS = 2;
        this.CSS_MODE_LESS = 1;
        this.CSS_MODE_STANDARD = 0;
        this.fileService.addFilesFromUrl();
        this.NAVBAR_VH_TARGET = 40;
        this.NAVBAR_PIXEL_HEIGHT_MAX = 240;
    }

    slAfterInit() {
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'j': {
                        event.preventDefault();

                        this.onBeautify();

                        break;
                    }
                    case 'm': {
                        event.preventDefault();

                        this.onRun();

                        break;
                    }
                }
            }
        }.bind(this));
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
                let tryItScript = null;

                for (let i = 0; i < scriptList.length; ++i) {
                    if (scriptList[i].hasAttribute('tryit-sling-script')) {
                        tryItScript = scriptList[i];
                        iframeEle.contentDocument.head.removeChild(scriptList[i]);
                    }
                }

                text = iframeEle.contentDocument.documentElement.outerHTML;
                text = text.split(SCRIPT_VALIDITY_CHECK_SOURCE).join('');

                if (tryItScript) {
                    iframeEle.contentDocument.head.appendChild(tryItScript);
                }
            } else if (iframeEle.contentWindow) {
                const scriptList = iframeEle.contentWindow.document.head.querySelectorAll('script');
                let tryItScript = null;

                for (let i = 0; i < scriptList.length; ++i) {
                    if (scriptList[i].hasAttribute('tryit-sling-script')) {
                        tryItScript = scriptList[i];
                        iframeEle.contentWindow.document.head.removeChild(scriptList[i]);
                    }
                }

                text = iframeEle.contentWindow.document.documentElement.outerHTML;
                text = text.split(SCRIPT_VALIDITY_CHECK_SOURCE).join('');

                if (tryItScript) {
                    iframeEle.contentDocument.head.appendChild(tryItScript);
                }
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

                    state.setEditIndex(this.fileService.getFileList().length - 1);

                    setState(state);
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

                    const fileList = this.fileService.getFileList();
                    let lastFileIndex = fileList.length;

                    if (iframeEle.contentDocument) {
                        const scriptList = iframeEle.contentDocument.head.querySelectorAll('script[tryit-filename]');
                        for (let i = 0; i < scriptList.length; ++i) {
                            let scriptText = scriptList[i].textContent;
                            scriptText = this.removeLastOccurrence(SCRIPT_VALIDITY_CHECK_SOURCE, scriptText);

                            const filename = scriptList[i].getAttribute('tryit-filename');
                            scriptList[i].removeAttribute('tryit-filename');

                            this.fileService.addFile(scriptText, true, false);
                            this.fileService.setFileName(lastFileIndex, filename);
                            lastFileIndex++;
                        }
                        for (let i = 0; i < scriptList.length; ++i) {
                            iframeEle.contentDocument.head.removeChild(scriptList[i]);
                        }

                        const orphanScriptList = iframeEle.contentDocument.head.querySelectorAll('script:not([tryit-filename]');
                        for (let i = 0; i < orphanScriptList.length; ++i) {
                            iframeEle.contentDocument.head.removeChild(orphanScriptList[i]);
                        }

                        const styleList = iframeEle.contentDocument.head.querySelectorAll('style[tryit-filename]');
                        for (let i = 0; i < styleList.length; ++i) {
                            const filename = styleList[i].getAttribute('tryit-filename');
                            styleList[i].removeAttribute('tryit-filename');

                            this.fileService.addFile(styleList[i].textContent, false, true);
                            this.fileService.setFileName(lastFileIndex, filename);
                            lastFileIndex++;
                        }
                        for (let i = 0; i < styleList.length; ++i) {
                            iframeEle.contentDocument.head.removeChild(styleList[i]);
                        }

                        const contentChildren = iframeEle.contentDocument.children;
                        let filename = null;

                        if (contentChildren && contentChildren.length > 0) {
                            filename = iframeEle.contentDocument.children[0].getAttribute('tryit-filename');
                            iframeEle.contentDocument.children[0].removeAttribute('tryit-filename');
                        }

                        const text = iframeEle.contentDocument.documentElement.outerHTML;
                        this.fileService.addFile(text);

                        if (filename) {
                            this.fileService.setFileName(lastFileIndex, filename);
                        }
                    } else if (iframeEle.contentWindow) {
                        const scriptList = iframeEle.contentWindow.document.head.querySelectorAll('script');
                        for (let i = 0; i < scriptList.length; ++i) {
                            let scriptText = scriptList[i].textContent;
                            scriptText = this.removeLastOccurrence(SCRIPT_VALIDITY_CHECK_SOURCE, scriptText);

                            const filename = scriptList[i].getAttribute('tryit-filename');
                            scriptList[i].removeAttribute('tryit-filename');

                            this.fileService.addFile(scriptText, true, false);
                            this.fileService.setFileName(lastFileIndex, filename);
                            lastFileIndex++;
                        }
                        for (let i = 0; i < scriptList.length; ++i) {
                            iframeEle.contentWindow.document.head.removeChild(scriptList[i]);
                        }

                        const styleList = iframeEle.contentDocument.head.querySelectorAll('style');
                        for (let i = 0; i < styleList.length; ++i) {
                            const filename = styleList[i].getAttribute('tryit-filename');
                            styleList[i].removeAttribute('tryit-filename');

                            this.fileService.addFile(styleList[i].textContent, false, true);
                            this.fileService.setFileName(lastFileIndex, filename);
                            lastFileIndex++;
                        }
                        for (let i = 0; i < scriptList.length; ++i) {
                            iframeEle.contentWindow.document.head.removeChild(styleList[i]);
                        }

                        const rootElement = iframeEle.contentWindow.document.documentElement;
                        let filename = null;

                        if (rootElement) {
                            filename = iframeEle.contentWindow.document.documentElement.getAttribute('tryit-filename');
                            iframeEle.contentWindow.document.documentElement.removeAttribute('tryit-filename');
                        }

                        const text = iframeEle.contentWindow.document.documentElement.outerHTML;
                        this.fileService.addFile(text);

                        if (filename) {
                            this.fileService.setFileName(lastFileIndex, filename);
                        }
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

    onShare() {
        const fileData = this.fileService.getFileList();
        const jsonString = JSON.stringify(fileData);

        const utf8Bytes = new TextEncoder().encode(jsonString);
        const compressedData = pako.deflate(utf8Bytes);
        const base64String = btoa(String.fromCharCode.apply(null, compressedData));
        const filesEncodedString = encodeURIComponent(base64String);

        let currentURL = window.location.origin;
        if (!currentURL.endsWith('/')) {
            currentURL += '/';
        }

        const state = getState();
        const cssEncodedString = encodeURIComponent(btoa(state.getCssMode()));

        const url = currentURL + '?files=' + filesEncodedString + '&mode=' + cssEncodedString;
        mount('tryit-sling-share', new ShareDialogComponent(url), s.CHANGE_DETECTOR_DETACHED);
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

    onToggleCss() {
        const state = getState();

        if (state.getCssMode() === this.CSS_MODE_LESS) {
            state.setCssMode(this.CSS_MODE_NESS);
        } else if (state.getCssMode() === this.CSS_MODE_NESS) {
            state.setCssMode(this.CSS_MODE_STANDARD);
        } else {
            state.setCssMode(this.CSS_MODE_LESS);
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
        const portraitMode = state.getPortraitMode();
        const lowResolution = state.getLowResolution();

        let font = ' font: 400 13.3333px Arial;';
        let padding = ' padding: 1px 6px;';
        let marginBottom = ' margin-bottom: 0.25rem;';
        let marginRight = ' margin-right: 0.25rem;';
        let headerPadding = ' padding: 0.5rem; ';
        let headerMargin = ' margin-bottom: 0.25rem;';
        let headerAlign = '';

        if (lowResolution) {
            font = ' font: 400 26px Arial;';
            padding = ' padding: 2px 12px;';
            marginBottom = ' margin-bottom: 0.75rem;';
            marginRight = ' margin-right: 0.75rem;';
            headerPadding = ' padding: 1rem 0.5rem 0.25rem 0.5rem;';
            headerMargin = ' margin-top: -0.75rem;';
            headerAlign = ' align-items: center; ';
        }

        if (portraitMode && lowResolution && window.screen.width < window.screen.height) {
            const vh = window.innerHeight / 100;

            let fourtyVhOrMax = vh * this.NAVBAR_VH_TARGET;

            if (fourtyVhOrMax > this.NAVBAR_PIXEL_HEIGHT_MAX) {
                fourtyVhOrMax = this.NAVBAR_PIXEL_HEIGHT_MAX;
            }

            headerAlign += ' min-height: ' + fourtyVhOrMax + 'px; ';
            padding = ' padding: 12px 12px;';
        }

        font += ' font-weight: 900;';

        return markup('div', {
            attrs: {
                style: 'background-color: rgb(46, 49, 56); display: flex; flex-direction: row; flex-wrap: wrap;' + headerPadding + headerAlign
            },
            children: [
                markup('div', {
                    attrs: {
                        style: 'margin-right: 0.5rem; display: inline-block; color: rgb(204, 204, 204); align-self: center;' + headerMargin
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
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Add File')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.expandHeight.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Expand')
                    ]
                }),
                ...(mod > 0 ? [
                    markup('button', {
                        attrs: {
                            onclick: this.shrinkHeight.bind(this),
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                        },
                        children: [
                            textNode('Shrink')
                        ]
                    })
                ] : []),
                markup('button', {
                    attrs: {
                        onclick: this.onRun.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Run')
                    ]
                }),
                ...(collapsedMode === true ? [
                    markup('button', {
                        attrs: {
                            onclick: this.togglePreview.bind(this),
                            style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                        },
                        children: [
                            textNode('Toggle Preview')
                        ]
                    })
                ] : []),
                markup('button', {
                    attrs: {
                        onclick: this.onExport.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Export')
                    ]
                }),
                markup('label', {
                    attrs: {
                        id: 'try-sling-import-label',
                        for: 'tryit-sling-import',
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); display: flex; align-items: center; ' + marginRight + '  ' + font + padding,
                    },
                    children: [
                        textNode('Import File')
                    ]
                }),
                markup('label', {
                    attrs: {
                        id: 'try-sling-import-workspace-label',
                        for: 'tryit-sling-import-workspace',
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); display: flex; align-items: center; ' + marginRight + '  ' + font + padding,
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
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Toggle Help')
                    ]
                }),
                markup('button', {
                    attrs: {
                        id: 'tryit-sling-clear-console',
                        onclick: this.onClearConsole.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Clear Console')
                    ]
                }),
                markup('button', {
                    attrs: {
                        id: 'tryit-sling-beautify',
                        onclick: this.onBeautify.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Format Code')
                    ]
                }),
                markup('button', {
                    attrs: {
                        id: 'tryit-sling-toggle-mode',
                        onclick: this.onToggleMode.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Toggle Mode')
                    ]
                }),
                markup('button', {
                    attrs: {
                        id: 'tryit-sling-toggle-css',
                        onclick: this.onToggleCss.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        ...(state.getCssMode() === this.CSS_MODE_LESS ? [textNode('Use Ness.js 1.5.0')] : []),
                        ...(state.getCssMode() === this.CSS_MODE_NESS ? [textNode('Use CSS')] : []),
                        ...(state.getCssMode() === this.CSS_MODE_STANDARD ? [textNode('Use Less.js 4.1.3')] : []),
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.onSlingDemo.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); ' + marginRight + '  ' + font + padding
                    },
                    children: [
                        textNode('Sling.js Demo')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.onShare.bind(this),
                        style: marginBottom + ' background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204);  ' + font + padding
                    },
                    children: [
                        textNode('Share')
                    ]
                })
            ]
        });
    }
}

export default NavbarComponent;
