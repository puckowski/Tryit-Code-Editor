import { detectChanges, getState, markup, textNode, version } from '../../../dist/sling.min';
import FileService from '../services/file.service';

class PreviewComponent {

    constructor() {
        this.fileService = new FileService();
        this.injectedList = '';
        this.onFileChangeFunction = () => {
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
                fileListJs.forEach((injectedScript) => {
                    if (injectedScript.index !== fileIndex && injectedScript.data && injectedScript.data.length > 0) {
                        var script = document.createElement('script');
                        script.text = injectedScript.data;
                        script.type = 'module';
                        htmlContainer.document.head.appendChild(script);
                        if (this.injectedList.length > 16) {
                            this.injectedList += ', ';
                        }

                        this.injectedList += (injectedScript.index + 1);
                        if (injectedScript.name.length > 0) {
                            this.injectedList += ' (' + injectedScript.name + ')';
                        }
                    }
                });

                fileListCss.forEach((injectedScript) => {
                    if (injectedScript.index !== fileIndex && injectedScript.data && injectedScript.data.length > 0) {
                        var stylesheet = document.createElement('style');
                        stylesheet.textContent = injectedScript.data;
                        htmlContainer.document.head.appendChild(stylesheet);
                        if (this.injectedList.length > 16) {
                            this.injectedList += ', ';
                        }

                        this.injectedList += (injectedScript.index + 1);
                        if (injectedScript.name.length > 0) {
                            this.injectedList += ' (' + injectedScript.name + ')';
                        }
                    }
                });

                var consoleScript = document.createElement('script');
                consoleScript.text = this.getConsoleScriptText();
                consoleScript.type = 'module';
                htmlContainer.document.head.appendChild(consoleScript);
            }

            htmlContainer.document.close();

            if (htmlContainer.document.head) {
                detectChanges();
            }
        };
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

    slAfterInit() {
        const state = getState();
        const sub = state.getDataSubject();
        if (!sub.getHasSubscription(this.onFileChangeFunction)) {
            sub.subscribe(this.onFileChangeFunction);
            sub.next(true);
        }
    }

    addFile() {
        this.fileService.addFile();
    }

    view() {
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
                        textNode('Preview')
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
                        slonlyself: 'true',
                        ...this.injectedList.length > 16 && { style: 'background-color: #ffffff; width: 100%; flex: 14;' },
                        ...this.injectedList.length <= 16 && { style: 'background-color: #ffffff; width: 100%; flex: 15;' }
                    }
                }),
                markup('textarea', {
                    attrs: {
                        id: 'tryit-sling-console',
                        style: 'width: 100%; flex: 4;',
                        placeholder: 'Text will appear when logged'
                    }
                })
            ]
        });
    }
}

export default PreviewComponent;
