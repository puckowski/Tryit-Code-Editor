import { detectChanges, getState, markup, textNode } from '../../../dist/sling.min';
import { slGet } from '../../../dist/sling-xhr.min';
import FileService from '../services/file.service';
import { SCRIPT_VALIDITY_CHECK_SOURCE } from '../stores/global.store';
import { debounce } from '../services/throttle.service';

class PreviewComponent {

    constructor() {
        this.fileService = new FileService();
        this.injectedList = '';
        this.isPreviewLoading = false;
        this.CONTENT_LOAD_CHECK_COUNT = 34;
        this.CSS_MODE_LESS = 1;
        this.CSS_MODE_NESS = 2;
        this.lessScriptData = null;
        this.nessScriptData = null;
        this.STANDARD_DELAY_MILLISECONDS = 300;
        this.debounce = debounce;
        this.debouncedFileChangeFunction = null;
        this.scriptNameMap = new Map();
        this.onInvalidScriptFunction = () => {
            detectChanges();
        }
        this.previewPendingData = { current: 0, old: 0 };
        this.onFileChangeFunction = () => {
            if (this.previewPendingData.current === this.previewPendingData.old) {
                this.previewPendingData.current = 0;
            }

            this.previewPendingData.current++;
            const fileListCurrent = this.fileService.getFileList();

            if (this.previewPendingData.current > 1 && fileListCurrent.length > 0) {
                return;
            }

            const state = getState();

            const collapsedMode = state.getCollapsedMode();
            const showPreview = state.getShowPreview();

            if (collapsedMode && !showPreview) {
                return;
            }

            let iframe = document.getElementById('tryit-sling-iframe');

            if (iframe === null) {
                return;
            }

            this.previewPendingData.old = this.previewPendingData.current;
            this.injectedList = 'Injected files: ';

            const newIFrame = document.createElement('iframe');
            let originalIFrame = iframe;

            newIFrame.style = iframe.style;
            iframe.parentElement.replaceChild(newIFrame, iframe);
            iframe = newIFrame;
            originalIFrame = null;

            const fileIndex = state.getEditIndex();
            const fileData = this.fileService.getFileData(fileIndex);

            this.prepareHtmlContainer(iframe, fileData);

            let fileListJs = this.fileService.getFileList();

            if (fileListJs.length === 0) {
                const invalidScriptSub = state.getInvalidScriptIndexSubject();
                invalidScriptSub.next([]);

                return;
            }

            fileListJs = fileListJs.filter(file => file.injectScript);

            let fileListCss = this.fileService.getFileList();
            fileListCss = fileListCss.filter(file => file.injectCss);

            const invalidIndexInitialSubject = state.getInvalidScriptIndexSubject();
            invalidIndexInitialSubject.next([]);

            setTimeout(() => {
                const iframe = document.getElementById('tryit-sling-iframe');
                const htmlContainer = this.prepareHtmlContainer(iframe, fileData);

                if (htmlContainer.document.head) {
                    this.injectedList = 'Injected files: ';

                    fileListCss.forEach((injectedScript) => {
                        if (injectedScript.index !== fileIndex && injectedScript.data && injectedScript.data.length > 0) {
                            if (this.injectedList.length > 16) {
                                this.injectedList += ', ';
                            }

                            this.injectedList += (injectedScript.index + 1);
                            if (injectedScript.name.length > 0) {
                                this.injectedList += ' (' + injectedScript.name + ')';
                            }
                        }
                    });

                    fileListJs.forEach((injectedScript) => {
                        if (injectedScript.index !== fileIndex && injectedScript.data && injectedScript.data.length > 0) {
                            if (this.injectedList.length > 16) {
                                this.injectedList += ', ';
                            }

                            this.injectedList += (injectedScript.index + 1);
                            if (injectedScript.name.length > 0) {
                                this.injectedList += ' (' + injectedScript.name + ')';
                            }

                            const invalidIndexSubject = state.getInvalidScriptIndexSubject();
                            const indices = invalidIndexSubject.getData();
                            const currentIndex = indices.indexOf(injectedScript.index);
                            if (currentIndex > -1) {
                                indices.splice(currentIndex, 1);
                            }
                            invalidIndexSubject.next(indices);
                        }
                    });

                    detectChanges();

                    const iframe = document.getElementById('tryit-sling-iframe');
                    const htmlContainer = this.prepareHtmlContainer(iframe, fileData);

                    const indexFileObj = this.fileService.getFile(fileIndex);

                    if (!indexFileObj) {
                        return;
                    }

                    const documentChildren = htmlContainer.document.children;
                    if (documentChildren && documentChildren.length > 0) {
                        htmlContainer.document.children[0].setAttribute('tryit-filename', indexFileObj.name ? indexFileObj.name : '');
                    }

                    fileListCss.forEach((injectedScript) => {
                        if (injectedScript.index !== fileIndex && injectedScript.data && injectedScript.data.length > 0) {
                            const stylesheet = document.createElement('style');
                            stylesheet.textContent = injectedScript.data;

                            if (state.getCssMode() === this.CSS_MODE_LESS) {
                                stylesheet.type = 'text/less';
                            }

                            stylesheet.setAttribute('tryit-filename', injectedScript.name ? injectedScript.name : '');

                            htmlContainer.document.head.appendChild(stylesheet);
                        }
                    });

                    const consoleScript = document.createElement('script');
                    consoleScript.text = this.getConsoleScriptText();
                    consoleScript.type = 'module';
                    consoleScript.setAttribute('tryit-sling-script', 'true');
                    htmlContainer.document.head.appendChild(consoleScript);

                    htmlContainer.addEventListener('error', (e) => {
                        const meta = Array.from(this.scriptNameMap.values()).find(m => m.url === e.filename);
                        if (meta) {
                            const script = document.createElement('script');
                            script.text = 'setTimeout(() => { console.error("Error injecting script: ' + e.message.replace(/"/g, '\\"') + '"); }, 0);';
                            script.type = 'module';
                            htmlContainer.document.head.appendChild(script);

                            const invalidIndexSubject = state.getInvalidScriptIndexSubject();
                            const indices = invalidIndexSubject.getData();
                            const currentIndex = indices.indexOf(meta.index);
                            if (currentIndex === -1) {
                                indices.push(meta.index);
                            }
                            invalidIndexSubject.next(indices);

                            clearInterval(meta.checkSuccessInterval);
                            this.isPreviewLoading = false;
                            detectChanges();
                        } else {
                            const script = document.createElement('script');
                            script.text = 'setTimeout(() => { console.error("Error injecting script: ' + e.message.replace(/"/g, '\\"') + '"); }, 0);';
                            script.type = 'module';
                            htmlContainer.document.head.appendChild(script);
                        }
                    });
                    htmlContainer.addEventListener('unhandledrejection', (e) => {
                        const script = document.createElement('script');
                        script.text = 'setTimeout(() => { console.error("Error injecting script: ' + e.message.replace(/"/g, '\\"') + '"); }, 0);';
                        script.type = 'module';
                        htmlContainer.document.head.appendChild(script);
                    });

                    fileListJs.forEach((injectedScript) => {
                        if (injectedScript.index !== fileIndex && injectedScript.data && injectedScript.data.length > 0) {
                            const script = document.createElement('script');
                            const blob = new Blob([injectedScript.data += '\n' + SCRIPT_VALIDITY_CHECK_SOURCE], { type: 'text/javascript' });
                            const url = URL.createObjectURL(blob);
                            const id = 'script-' + Date.now();
                            script.type = 'module';
                            script.src = url;
                            script.dataset.id = id;

                            let tryitCountOriginal = localStorage.getItem('tryitCount');
                            if (!tryitCountOriginal) {
                                tryitCountOriginal = 0;
                                localStorage.setItem('tryitCount', tryitCountOriginal);
                            } else {
                                tryitCountOriginal = Number(tryitCountOriginal);
                            }

                            let successRunCount = 0;
                            this.isPreviewLoading = true;

                            const checkSuccessInterval = setInterval(() => {
                                const tryitCountFinal = Number(localStorage.getItem('tryitCount'));
                                const fileList = this.fileService.getFileList();
                                const invalidIndexSubject = state.getInvalidScriptIndexSubject();

                                if (fileList.length === 0) {
                                    this.injectedList = 'Injected files: ';
                                    clearInterval(checkSuccessInterval);
                                    this.isPreviewLoading = false;
                                    detectChanges();
                                } else if (tryitCountOriginal === tryitCountFinal) {
                                    const indices = invalidIndexSubject.getData();
                                    if (!indices.includes(injectedScript.index)) {
                                        indices.push(injectedScript.index);
                                    }
                                    invalidIndexSubject.next(indices);
                                } else {
                                    const indices = invalidIndexSubject.getData();
                                    const currentIndex = indices.indexOf(injectedScript.index);
                                    if (currentIndex > -1) {
                                        indices.splice(currentIndex, 1);
                                    }
                                    invalidIndexSubject.next(indices);
                                }

                                successRunCount++;

                                if (successRunCount === this.CONTENT_LOAD_CHECK_COUNT || invalidIndexSubject.getData().length === 0) {
                                    clearInterval(checkSuccessInterval);
                                    this.isPreviewLoading = false;
                                    detectChanges();
                                }
                            }, this.STANDARD_DELAY_MILLISECONDS);

                            this.scriptNameMap.set(id, { element: script, url, index: injectedScript.index, checkSuccessInterval });

                            script.setAttribute('tryit-filename', injectedScript.name ? injectedScript.name : '');

                            htmlContainer.document.head.appendChild(script);
                        }
                    });

                    if (state.getCssMode() === this.CSS_MODE_LESS) {
                        if (this.lessScriptData === null) {
                            slGet('less.min.js').then(xhrResp => {
                                this.lessScriptData = xhrResp.response;

                                var script = document.createElement('script');
                                script.text = this.lessScriptData;
                                script.type = 'module';

                                htmlContainer.document.head.appendChild(script);
                            });
                        } else {
                            var script = document.createElement('script');
                            script.text = this.lessScriptData;
                            script.type = 'module';

                            htmlContainer.document.head.appendChild(script);
                        }
                    } else if (state.getCssMode() === this.CSS_MODE_NESS) {
                        if (this.nessScriptData === null) {
                            slGet('ness.min.js').then(xhrResp => {
                                this.nessScriptData = xhrResp.response;

                                var script = document.createElement('script');
                                script.text = this.nessScriptData;
                                script.type = 'module';

                                htmlContainer.document.head.appendChild(script);
                            });
                        } else {
                            var script = document.createElement('script');
                            script.text = this.nessScriptData;
                            script.type = 'module';

                            htmlContainer.document.head.appendChild(script);
                        }
                    }

                    this.previewPendingData.current--;
                } else {
                    const invalidScriptSub = state.getInvalidScriptIndexSubject();
                    invalidScriptSub.next([]);
                }

                htmlContainer.document.close();

                if (htmlContainer.document.head) {
                    detectChanges();
                }
            }, 0);
        };
    }

    slAfterInit() {
        const state = getState();
        const sub = state.getDataSubject();
        this.debouncedFileChangeFunction = this.debounce(this.onFileChangeFunction, this.STANDARD_DELAY_MILLISECONDS);
        if (!sub.getHasSubscription(this.debouncedFileChangeFunction)) {
            sub.subscribe(this.debouncedFileChangeFunction);
            sub.next(true);
        }

        const subInvalid = state.getInvalidScriptIndexSubject();
        if (!subInvalid.getHasSubscription(this.onInvalidScriptFunction)) {
            subInvalid.subscribe(this.onInvalidScriptFunction);
        }
    }

    slOnDestroy() {
        const state = getState();
        const sub = state.getDataSubject();
        if (sub.getHasSubscription(this.debouncedFileChangeFunction)) {
            sub.clearSubscription(this.debouncedFileChangeFunction);
        }

        const subInvalid = state.getInvalidScriptIndexSubject();
        if (subInvalid.getHasSubscription(this.onInvalidScriptFunction)) {
            subInvalid.clearSubscription(this.onInvalidScriptFunction);
        }
    }

    prepareHtmlContainer(iframe, fileData) {
        const htmlContainer = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;

        htmlContainer.document.open();
        htmlContainer.document.write(fileData);

        if (fileData === '') {
            htmlContainer.document.close();
        }

        return htmlContainer;
    }

    getConsoleScriptText() {
        const consoleScript = 'const console=(function(oldCons) { return {' +
            'log: function(text) { oldCons.log(text); const console = window.parent.document.getElementById(\'tryit-sling-console\'); console.value += text + \'\\r\\n\'; console.scrollTop = console.scrollHeight; },' +
            'info: function (text) { oldCons.info(text); const console = window.parent.document.getElementById(\'tryit-sling-console\'); console.value += text + \'\\r\\n\'; console.scrollTop = console.scrollHeight; },' +
            'warn: function (text) { oldCons.warn(text); const console = window.parent.document.getElementById(\'tryit-sling-console\'); console.value += text + \'\\r\\n\'; console.scrollTop = console.scrollHeight; },' +
            'error: function (text) { oldCons.error(text); const console = window.parent.document.getElementById(\'tryit-sling-console\'); console.value += text + \'\\r\\n\'; console.scrollTop = console.scrollHeight; },' +
            'debug: function (text) { oldCons.debug(text); const console = window.parent.document.getElementById(\'tryit-sling-console\'); console.value += text + \'\\r\\n\'; console.scrollTop = console.scrollHeight; },' +
            'clear: function (text) { oldCons.clear(text); const console = window.parent.document.getElementById(\'tryit-sling-console\'); console.value = \'\'; console.scrollTop = console.scrollHeight; },' +
            'trace: oldCons.trace,' +
            'timeStamp: oldCons.timeStamp,' +
            'timeLog: oldCons.timeLog,' +
            'timeEnd: oldCons.timeEnd,' +
            'time: oldCons.time,' +
            'table: oldCons.table,' +
            'profileEnd: oldCons.profileEnd,' +
            'profile: oldCons.profile,' +
            'groupEnd: oldCons.groupEnd,' +
            'groupCollapsed: oldCons.groupCollapsed,' +
            'group: oldCons.group,' +
            'dir: oldCons.dir,' +
            'dirxml: oldCons.dirxml,' +
            'count: oldCons.count,' +
            'countReset: oldCons.countReset,' +
            'assert: oldCons.assert,' +
            'slingTryIt: true' +
            '}; }(window.console)); if (window.console.slingTryIt !== true) { window.console = console; }';

        return consoleScript;
    }

    addFile() {
        this.fileService.addFile();
    }

    getInvalidScriptMessage() {
        const state = getState();
        const sub = state.getInvalidScriptIndexSubject();
        const indices = sub.getData();

        if (indices && indices.length > 0) {
            let message = 'Files Not Loaded: ';

            indices.forEach((fileIndex, index) => {
                if (index > 0) {
                    message += ', ';
                }

                message += 'File ' + (fileIndex + 1);
            });

            return message + ' ';
        } else {
            return '';
        }
    }

    view() {
        const invalidMessage = this.getInvalidScriptMessage();
        const state = getState();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 26px Arial;';
        }

        return markup('div', {
            attrs: {
                style: 'padding: 0.25rem; color: rgb(204, 204, 204); max-height: inherit; overflow: auto; display: flex; flex-direction: column; height: calc(100% - 0.5rem);'
            },
            children: [
                markup('h4', {
                    attrs: {
                        style: 'margin: 0px; flex-shrink: 1;'
                    },
                    children: [
                        ...(invalidMessage.length === 0 && !this.isPreviewLoading ? textNode('Preview') : []),
                        ...(invalidMessage.length !== 0 && !this.isPreviewLoading ? textNode(invalidMessage) : []),
                        ...(invalidMessage.length !== 0 && !this.isPreviewLoading ? [markup('span', {
                            attrs: {
                                'style': 'font-family: sans-serif; color: red'
                            },
                            children: [
                                textNode('X')
                            ]
                        })] : []),
                        ...(this.isPreviewLoading ? textNode('Loading...') : [])
                    ]
                }),
                ...(this.injectedList.length > 16 ? [
                    markup('div', {
                        attrs: {
                            style: 'background-color: rgb(46, 49, 56); padding: 0.25rem; flex-shrink: 1;'
                        },
                        children: [
                            textNode(this.injectedList)
                        ]
                    })
                ] : []),
                markup('iframe', {
                    attrs: {
                        frameborder: '0',
                        id: 'tryit-sling-iframe',
                        sldirective: 'onlyself',
                        ...this.injectedList.length > 16 && { style: 'background-color: #ffffff; width: 100%; flex: 14;' },
                        ...this.injectedList.length <= 16 && { style: 'background-color: #ffffff; width: 100%; flex: 15;' }
                    }
                }),
                markup('textarea', {
                    attrs: {
                        id: 'tryit-sling-console',
                        sldirective: 'onlyself',
                        style: 'width: 100%; flex: 4;' + font,
                        placeholder: 'Text will appear when logged'
                    }
                })
            ]
        });
    }
}

export default PreviewComponent;
