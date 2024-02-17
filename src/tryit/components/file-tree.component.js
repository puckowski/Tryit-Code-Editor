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
        setState(state);
        state.getDataSubject().next(true);
    }

    onRemoveFile(index) {
        this.fileService.removeFile(index);
        const state = getState();
        let editIndex = state.getEditIndex();
        if (editIndex >= index) {
            editIndex--;
        }
        state.setEditIndex(editIndex);
        state.setCaretPositionToRestore(0);
        setState(state);
        state.getDataSubject().next(true);
    }

    onToggleInject(index) {
        this.fileService.updateFileInject(index);

        if (!this.fileService.getFile(index).injectScript) {
            const ele = document.getElementById('file-inject-script-checkbox' + index);
            ele.checked = false;
        }

        const state = getState();
        state.getDataSubject().next(true);
    }

    onToggleInjectCss(index) {
        this.fileService.updateFileInjectCss(index);

        if (!this.fileService.getFile(index).injectCss) {
            const ele = document.getElementById('file-inject-css-checkbox' + index);
            ele.checked = false;
        }

        const state = getState();
        state.getDataSubject().next(true);
    }

    applyCheckedValuesAfterRender() {
        const fileList = this.fileService.getFileList();

        const divTreeElement = document.getElementById('div-file-tree');
        const checkboxElements = divTreeElement.querySelectorAll('input[type=checkbox]');

        for (let i = 0; i < checkboxElements.length; ++i) {
            const file = fileList[Math.floor(i / 2)];

            if (i % 2 === 0 && file.injectScript) {
                checkboxElements[i].checked = true;
            } else if (i % 2 !== 0 && file.injectCss) {
                checkboxElements[i].checked = true;
            } else {
                checkboxElements[i].checked = false;
            }
        }
    }

    view() {
        const fileList = this.fileService.getFileList();
        const state = getState();
        const editIndex = state.getEditIndex();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 26px Arial;';
        }

        font += ' font-weight: 900;';

        setTimeout(() => {
            this.applyCheckedValuesAfterRender();
        }, 0);

        return markup('div', {
            attrs: {
                style: 'background-color: rgb(32, 35, 39); color: rgb(204, 204, 204); overflow: auto; max-height: inherit;' + font,
                id: 'div-file-tree'
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
                                    style: 'word-break: break-word; margin: 0 0.5rem 0.5rem 0; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204);' + font,
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
                                    style: 'word-break: break-word; margin: 0 0.5rem 0.5rem 0; background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204);' + font,
                                    onclick: this.onRemoveFile.bind(this, file.index)
                                },
                                children: [
                                    textNode('Remove File')
                                ],
                            }),
                            ...(file.index !== this.editNameIndex ? [
                                markup('div', {
                                    children: [
                                        ...(editIndex === file.index ? [
                                            markup('span', {
                                                attrs: {
                                                    style: 'word-break: break-word;'
                                                },
                                                children: [
                                                    textNode('File ' + (file.index + 1) + ': ' + file.name)
                                                ]
                                            })
                                        ] : [
                                            markup('div', {
                                                attrs: {
                                                    style: 'word-break: break-word;'
                                                },
                                                children: [
                                                    textNode('File ' + (file.index + 1) + ': ' + file.name)
                                                ]
                                            })
                                        ])
                                    ]
                                })
                            ] : []),
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
                                            id: 'file-inject-script-checkbox' + file.index,
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
                                            id: 'file-inject-css-checkbox' + file.index,
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
