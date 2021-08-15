import { getState, markup, textNode } from '../../../dist/sling.min';
import FileService from '../services/file.service';

class SourcePanelComponent {

    constructor() {
        this.fileService = new FileService();
    }

    slAfterInit() {
        const state = getState();
        const sub = state.getDataSubject();
        sub.subscribe(() => {
            const state = getState();
            const fileIndex = state.getEditIndex();
            const fileData = this.fileService.getFileData(fileIndex);

            const textAreaEle = document.getElementById('tryit-sling-textarea');
            textAreaEle.value = fileData;
        });
    }

    onInput(event) {
        const state = getState();
        const fileIndex = state.getEditIndex();
        this.fileService.updateFileData(fileIndex, event.target.value)
    }

    view() {
        const state = getState();
        const fileIndex = state.getEditIndex();
        const file = this.fileService.getFile(fileIndex);

        return markup('div', {
            attrs: {
                style: 'padding: 0.25rem; background-color: rgb(21, 24, 30); color: rgb(204, 204, 204) !important; overflow: auto; height: calc(100% - 0.5rem); display: flex; flex-direction: column;'
            },
            children: [
                markup('h4', {
                    attrs: {
                        style: 'margin: 0px; flex: 1;'
                    },
                    children: [
                        ...(file ? [
                            textNode('File ' + (file.index + 1) + ': ' + file.name)
                        ] : []),
                    ]
                }),
                markup('textarea', {
                    attrs: {
                        style: 'width: 100%; background-color: rgb(0, 0, 0); border: none; color: rgb(204, 204, 204); flex: 19;',
                        oninput: this.onInput.bind(this),
                        id: 'tryit-sling-textarea'
                    }
                })
            ]
        });
    }
}

export default SourcePanelComponent;
