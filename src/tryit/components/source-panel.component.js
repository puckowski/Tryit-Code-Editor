import { getState, markup, setState, textNode } from '../../../dist/sling.min';
import FileService from '../services/file.service';
import WordSuggestionComponent from './suggestion-popup.component';
import hljs from '../../../js/highlight';
import { getCaretPosition } from '../services/caret.service';

class SourcePanelComponent {

    constructor() {
        this.fileService = new FileService();
        this.onFileChangeFunction = () => {
            let state = getState();
            if (state.getPreserveFocus()) {
                state.setPreserveFocus(false);
                setState(state);
            } else {
                const textAreaEle = document.getElementById('tryit-sling-div');

                if (textAreaEle) {
                    s.DETACHED_SET_TIMEOUT(() => {
                        state = getState();
                        const fileIndex = state.getEditIndex();
                        const fileData = this.fileService.getFileData(fileIndex);

                        textAreaEle.focus();
                        textAreaEle.textContent = fileData;
                        this.highlightCode();
                        this.setCurrentCursorPosition(state.getCaretPositionToRestore());
                    }, 100);
                }
            }
        };
        this.wordSuggestionComp = new WordSuggestionComponent();
    }

    slAfterInit() {
        const state = getState();
        const sub = state.getDataSubject();
        if (!sub.getHasSubscription(this.onFileChangeFunction)) {
            sub.subscribe(this.onFileChangeFunction);
            sub.next(true);
        }
    }

    createRange(node, chars, range) {
        if (!range) {
            range = document.createRange()
            range.selectNode(node);
            range.setStart(node, 0);
        }

        if (chars.count === 0) {
            range.setEnd(node, chars.count);
        } else if (node && chars.count > 0) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent.length < chars.count) {
                    chars.count -= node.textContent.length;
                } else {
                    range.setEnd(node, chars.count);
                    chars.count = 0;
                }
            } else {
                for (var lp = 0; lp < node.childNodes.length; lp++) {
                    range = this.createRange(node.childNodes[lp], chars, range);

                    if (chars.count === 0) {
                        break;
                    }
                }
            }
        }

        return range;
    }

    setCurrentCursorPosition(chars) {
        if (chars >= 0) {
            var selection = window.getSelection();

            const range = this.createRange(document.getElementById('tryit-sling-div'), { count: chars });

            if (range) {
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    highlightCode() {
        const textAreaEle = document.getElementById('tryit-sling-div');
        const caretPos = getCaretPosition(textAreaEle);
        hljs.highlightElement(textAreaEle);
        this.setCurrentCursorPosition(caretPos);
    }

    onInput(event) {
        const state = getState();
        const fileIndex = state.getEditIndex();
        this.fileService.updateFileData(fileIndex, event.target.textContent);
        this.highlightCode();
    }

    view() {
        const state = getState();
        const fileIndex = state.getEditIndex();
        const file = this.fileService.getFile(fileIndex);
        const fileList = this.fileService.getFileList();
        // const fileListLength = fileList ? fileList.length : 0;

        return markup('div', {
            attrs: {
                style: 'padding: 0.25rem; background-color: rgb(21, 24, 30); color: rgb(204, 204, 204); overflow: auto; height: calc(100% - 0.5rem); display: flex; flex-direction: column;'
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
                markup('div', {
                    attrs: {
                        style: 'width: 100%; background-color: rgb(0, 0, 0); border: none; color: rgb(204, 204, 204); flex: 19;',
                        oninput: this.onInput.bind(this),
                        id: 'tryit-sling-div',
                        contenteditable: 'true',
                        sldirective: 'useexsting',
                        class: 'javascript'
                    },
                    children: [
                        textNode(this.fileService.getFileData(fileIndex))
                    ]
                }),
                this.wordSuggestionComp
            ]
        });
    }
}

export default SourcePanelComponent;
