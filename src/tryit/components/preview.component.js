import { detectChanges, getState, markup, textNode, version } from '../../../dist/sling.min';
import FileService from '../services/file.service';

class PreviewComponent {

    constructor() {
        this.fileService = new FileService();
        this.injectedList = '';
    }

    slAfterInit() {
        const state = getState();
        const sub = state.getDataSubject();
        sub.subscribe(() => {
            this.injectedList = 'Injected scripts: ';
            const iframe = document.getElementById('tryit-sling-iframe');

            const state = getState();
            const fileIndex = state.getEditIndex();
            const fileData = this.fileService.getFileData(fileIndex);

            let fileList = this.fileService.getFileList();
            fileList = fileList.filter(file => file.injectScript);

            const htmlContainer = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
            htmlContainer.document.open();
            htmlContainer.document.write(fileData);

            if (htmlContainer.document.head) {
                fileList.forEach((injectedScript, index) => {
                    if (injectedScript.index !== fileIndex && injectedScript.data && injectedScript.data.length > 0) {
                        var script = document.createElement('script');
                        script.type = 'text/javascript';
                        script.text = injectedScript.data;
                        script.type = 'module';
                        htmlContainer.document.head.appendChild(script);
                        if (index > 0) {
                            this.injectedList += ', ';
                        }

                        this.injectedList += (injectedScript.index + 1);
                        if (injectedScript.name.length > 0) {
                            this.injectedList += ' (' + injectedScript.name + ')';
                        }
                    }
                });
            }

            htmlContainer.document.close();

            if (htmlContainer.document.head) {
                detectChanges();
            }
        });
        sub.next(true);
    }

    addFile() {
        this.fileService.addFile();
    }

    view() {
        return markup('div', {
            attrs: {
                style: 'color: rgb(204, 204, 204); max-height: inherit; overflow: auto;'
            },
            children: [
                markup('h4', {
                    children: [
                        textNode('Preview')
                    ]
                }),
                ...(this.injectedList.length > 18 ? [
                    markup('div', {
                        attrs: {
                            style: 'background-color: rgb(46, 49, 56); padding: 0.25rem;'
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
                        style: 'background-color: #ffffff;'
                    }
                })
            ]
        });
    }
}

export default PreviewComponent;
