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

                        const caretRestore = state.getCaretPositionToRestore();
                        this.setCurrentCursorPosition(caretRestore);
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
        setTimeout(() => {
            const state = getState();
            const fileIndex = state.getEditIndex();
            const fileData = this.fileService.getFileData(fileIndex);
            let code = this.fileService.getFileData(fileIndex);
            const textAreaEle = document.getElementById('tryit-sling-div');
            textAreaEle.textContent = code;

            hljs.highlightElement(textAreaEle);

            const caretRestore = state.getCaretPositionToRestore();
            this.setCurrentCursorPosition(caretRestore);

            const sub = state.getHasHighlightedSubject();
            sub.next(true);
        }, 0);
    }

    onInput(event) {
        const state = getState();

        const textAreaEle = document.getElementById('tryit-sling-div');
        let caretPos = getCaretPosition(textAreaEle);

        if (event && event.inputType === 'insertParagraph') {
            let content = event.target.textContent;
            content = content.substring(0, caretPos) + '\n' + content.substring(caretPos);
            event.target.textContent = content;
            caretPos++;
        }

        state.setCaretPositionToRestore(caretPos);

        const fileIndex = state.getEditIndex();
        this.fileService.updateFileData(fileIndex, event.target.textContent);
        this.highlightCode();

        setState(state);
    }

    view() {
        const state = getState();
        const fileIndex = state.getEditIndex();
        const file = this.fileService.getFile(fileIndex);
        const fileList = this.fileService.getFileList();
        const fileListLength = fileList ? fileList.length : 0;

        return markup('div', {
            attrs: {
                style: 'padding: 0.25rem; background-color: rgb(21, 24, 30); color: rgb(204, 204, 204); height: calc(100% - 0.5rem); display: flex; flex-direction: column;'
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
                        style: 'width: 100%; background-color: rgb(0, 0, 0); border: none; color: rgb(204, 204, 204); flex: 19; white-space: pre; overflow: auto; padding: 0.25rem;',
                        oninput: this.onInput.bind(this),
                        id: 'tryit-sling-div',
                        sldirective: 'onlyself',
                        ...(file && file.injectScript) && { 'class': 'javascript' },
                        ...(file && file.injectCss) && { 'class': 'css' },
                        ...(file && !file.injectScript && !file.injectCss) && { 'class': 'html' },
                        ...fileListLength > 0 && { 'contenteditable': 'true' }
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
