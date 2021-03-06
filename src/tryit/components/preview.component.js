import { detectChanges, getState, markup, setState, textNode, version } from '../../../dist/sling.min';
import FileService from '../services/file.service';
import { SCRIPT_VALIDITY_CHECK_SOURCE } from '../stores/global.store';

class PreviewComponent {

    constructor() {
        this.fileService = new FileService();
        this.injectedList = '';
        this.isPreviewLoading = false;
        this.CONTENT_LOAD_CHECK_COUNT = 34;
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

            this.previewPendingData.old = this.previewPendingData.current;

            this.injectedList = 'Injected files: ';
            const iframe = document.getElementById('tryit-sling-iframe');

            const state = getState();
            const fileIndex = state.getEditIndex();
            const fileData = this.fileService.getFileData(fileIndex);

            let fileListJs = this.fileService.getFileList();
            fileListJs = fileListJs.filter(file => file.injectScript);

            let fileListCss = this.fileService.getFileList();
            fileListCss = fileListCss.filter(file => file.injectCss);

            const htmlContainer = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
            htmlContainer.document.open();
            htmlContainer.document.write(fileData);

            if (htmlContainer.document.head) {
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

                const htmlContainer = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
                htmlContainer.document.open();
                htmlContainer.document.write(fileData);
                
                fileListCss.forEach((injectedScript) => {
                    if (injectedScript.index !== fileIndex && injectedScript.data && injectedScript.data.length > 0) {
                        var stylesheet = document.createElement('style');
                        stylesheet.textContent = injectedScript.data;
                        htmlContainer.document.head.appendChild(stylesheet);
                    }
                });

                const consoleScript = document.createElement('script');
                consoleScript.text = this.getConsoleScriptText();
                consoleScript.type = 'module';
                consoleScript.setAttribute('tryit-sling-script', 'true');
                htmlContainer.document.head.appendChild(consoleScript);

                fileListJs.forEach((injectedScript) => {
                    if (injectedScript.index !== fileIndex && injectedScript.data && injectedScript.data.length > 0) {
                        var script = document.createElement('script');
                        script.text = injectedScript.data += '\n' + SCRIPT_VALIDITY_CHECK_SOURCE;
                        script.type = 'module';

                        let tryitCountOriginal = localStorage.getItem('tryitCount');
                        if (!tryitCountOriginal) {
                            tryitCountOriginal = 0;
                            localStorage.setItem('tryitCount', tryitCountOriginal);
                        } else {
                            tryitCountOriginal = Number(tryitCountOriginal);
                        }

                        let successRunCount = 0;
                        this.isPreviewLoading = true;

                        const checkSuccessInterval = s.DETACHED_SET_INTERVAL(() => {
                            const tryitCountFinal = Number(localStorage.getItem('tryitCount'));
                            const fileList = this.fileService.getFileList();

                            if (fileList.length === 0) {
                                this.injectedList = 'Injected files: ';
                                clearInterval(checkSuccessInterval);
                                this.isPreviewLoading = false;
                                detectChanges();
                            } else if (tryitCountOriginal === tryitCountFinal) {
                                const invalidIndexSubject = state.getInvalidScriptIndexSubject();
                                const indices = invalidIndexSubject.getData();
                                if (!indices.includes(injectedScript.index)) {
                                    indices.push(injectedScript.index);
                                }
                                invalidIndexSubject.next(indices);
                            } else {
                                const invalidIndexSubject = state.getInvalidScriptIndexSubject();
                                const indices = invalidIndexSubject.getData();
                                const currentIndex = indices.indexOf(injectedScript.index);
                                if (currentIndex > -1) {
                                    indices.splice(currentIndex, 1);
                                }
                                invalidIndexSubject.next(indices);
                            }

                            successRunCount++;

                            if (successRunCount === this.CONTENT_LOAD_CHECK_COUNT) {
                                clearInterval(checkSuccessInterval);
                                this.isPreviewLoading = false;
                                detectChanges();
                            }
                        }, 300);

                        htmlContainer.document.head.appendChild(script);
                    }
                });

                this.previewPendingData.current--;
            } else {
                const invalidScriptSub = state.getInvalidScriptIndexSubject();
                invalidScriptSub.next([]);
            }

            htmlContainer.document.close();

            if (htmlContainer.document.head) {
                detectChanges();
            }
        };
    }

    slAfterInit() {
        const state = getState();
        const sub = state.getDataSubject();
        if (!sub.getHasSubscription(this.onFileChangeFunction)) {
            sub.subscribe(this.onFileChangeFunction);
            sub.next(true);
        }

        const subInvalid = state.getInvalidScriptIndexSubject();
        if (!subInvalid.getHasSubscription(this.onInvalidScriptFunction)) {
            subInvalid.subscribe(this.onInvalidScriptFunction);
        }
    }

    getConsoleScriptText() {
        const consoleScript = 'const console=(function(oldCons) { return {' +
            'log: function(text) { oldCons.log(text); window.parent.document.getElementById(\'tryit-sling-console\').value += text + \'\\r\\n\'; },' +
            'info: function (text) { oldCons.info(text); window.parent.document.getElementById(\'tryit-sling-console\').value += text + \'\\r\\n\'; },' +
            'warn: function (text) { oldCons.warn(text); window.parent.document.getElementById(\'tryit-sling-console\').value += text + \'\\r\\n\'; },' +
            'error: function (text) { oldCons.error(text); window.parent.document.getElementById(\'tryit-sling-console\').value += text + \'\\r\\n\'; }' +
            '}; }(window.console)); window.console = console;';

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
                        style: 'margin: 0px; flex: 1;'
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
                            style: 'background-color: rgb(46, 49, 56); padding: 0.25rem; flex: 1;'
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
