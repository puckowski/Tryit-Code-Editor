import { markup, setState, textNode, getState } from '../../../dist/sling.min';
import FileService from '../services/file.service';

class FileTreeComponent {

    constructor() {
        this.fileService = new FileService();
        this.editNameIndex = -1;
        this.editedFileName = '';
    }

    onEditName(index) {
        this.editNameIndex = index;
        const file = this.fileService.getFile(index);
        this.editedFileName = file.name ? file.name : '';
    }

    onFinishEditName(index) {
        this.fileService.setFileName(index, this.editedFileName);
        this.editedFileName = '';
        this.editNameIndex = -1;
    }

    onFileNameInput(event) {
        this.editedFileName = event.target.value;
    }

    onFileSelection(index) {
        const state = getState();
        state.setEditIndex(index);
        if (this.editNameIndex >= 0) {
            state.setPreserveFocus(true);
        }
        state.getDataSubject().next(true);
        setState(state);
    }

    onRemoveFile(index) {
        this.fileService.removeFile(index);
        const state = getState();
        state.getDataSubject().next(true);
    }

    onToggleInject(index) {
        this.fileService.updateFileInject(index);
        this.fileService.updateFileInjectCss(index, false);
        const state = getState();
        state.getDataSubject().next(true);
    }

    onToggleInjectCss(index) {
        this.fileService.updateFileInjectCss(index);
        this.fileService.updateFileInject(index, false);
        const state = getState();
        state.getDataSubject().next(true);
    }

    view() {
        const fileList = this.fileService.getFileList();
        const state = getState();
        const editIndex = state.getEditIndex();

        return markup('div', {
            attrs: {
                style: 'background-color: rgb(32, 35, 39); color: rgb(204, 204, 204); overflow: auto; max-height: inherit;'
            },
            children: [
                ...Array.from(fileList, (file, index) =>
                    markup('div', {
                        attrs: {
                            ...editIndex !== file.index && index % 2 === 0 && { style: 'padding: 0.5rem;' },
                            ...editIndex !== file.index && index % 2 !== 0 && { style: 'padding: 0.5rem; background-color: rgb(21, 24, 30);' },
                            ...editIndex === file.index && { style: 'padding: 0.5rem; background-color: rgb(60, 68, 83);' },
                            onclick: this.onFileSelection.bind(this, file.index)
                        },
                        children: [
                            markup('button', {
                                attrs: {
                                    style: 'margin: 0 0.5rem 0.5rem 0; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204);',
                                    ...file.index !== this.editNameIndex && { onclick: this.onEditName.bind(this, file.index) },
                                    ...file.index === this.editNameIndex && { onclick: this.onFinishEditName.bind(this, file.index) },
                                },
                                children: [
                                    ...(file.index === this.editNameIndex ? [
                                        textNode('Save Name')
                                    ] : [
                                        textNode('Edit Name')
                                    ])
                                ],

                            }),
                            markup('button', {
                                attrs: {
                                    style: 'margin-right: 0 0.5rem 0.5rem 0; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204);',
                                    onclick: this.onRemoveFile.bind(this, file.index)
                                },
                                children: [
                                    textNode('Remove File')
                                ],
                            }),
                            markup('div', {
                                children: [
                                    ...(editIndex === file.index ? [
                                        markup('strong', {
                                            children: [
                                                textNode('File ' + (file.index + 1) + ': ' + file.name)
                                            ]
                                        })
                                    ] : [
                                        textNode('File ' + (file.index + 1) + ': ' + file.name)
                                    ])
                                ]
                            }),
                            ...(file.index === this.editNameIndex ? [
                                markup('input', {
                                    attrs: {
                                        style: 'width: 100%; padding: 1px 2px;',
                                        oninput: this.onFileNameInput.bind(this),
                                        value: this.editedFileName
                                    }
                                })
                            ] : []),
                            markup('div', {
                                children: [
                                    markup('span', {
                                        attrs: {
                                            style: 'margin-right: 0.25rem;'
                                        },
                                        children: [
                                            textNode('Inject Script')
                                        ]
                                    }),
                                    markup('input', {
                                        attrs: {
                                            type: 'checkbox',
                                            ...file.injectScript && { checked: 'true' },
                                            onchange: this.onToggleInject.bind(this, file.index)
                                        }
                                    })
                                ]
                            }),
                            markup('div', {
                                children: [
                                    markup('span', {
                                        attrs: {
                                            style: 'margin-right: 0.25rem;'
                                        },
                                        children: [
                                            textNode('Inject CSS')
                                        ]
                                    }),
                                    markup('input', {
                                        attrs: {
                                            type: 'checkbox',
                                            ...file.injectCss && { checked: 'true' },
                                            onchange: this.onToggleInjectCss.bind(this, file.index)
                                        }
                                    })
                                ]
                            })
                        ]
                    })
                )
            ]
        });
    }
}

export default FileTreeComponent;
