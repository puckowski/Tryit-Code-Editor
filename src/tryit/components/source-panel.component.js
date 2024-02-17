import { getState, markup, setState, textNode } from '../../../dist/sling.min';
import FileService from '../services/file.service';
import WordSuggestionComponent from './suggestion-popup.component';
import { getCaretPosition } from '../services/caret.service';

class SourcePanelComponent {

    constructor() {
        this.fileService = new FileService();
        this.hljs = null;
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

                        const collapsedMode = state.getCollapsedMode();
                        const showPreview = state.getShowPreview();

                        if (collapsedMode && showPreview) {
                            return;
                        }

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

    setCurrentCursorPosition(charOffset) {
        if (charOffset >= 0) {
            const el = document.getElementById('tryit-sling-div');
            const range = document.createRange();
            const selection = window.getSelection();

            let currentNode = el.firstChild;
            let totalOffset = 0;
            let foundNode = null;

            while (currentNode) {
                if (currentNode.nodeType === Node.TEXT_NODE) {
                    const nodeLength = currentNode.length;

                    if (totalOffset + nodeLength >= charOffset) {
                        foundNode = currentNode;

                        break;
                    } else {
                        totalOffset += nodeLength;
                    }
                } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                    const textContent = currentNode.textContent;
                    const nodeLength = textContent.length;

                    if (totalOffset + nodeLength >= charOffset) {
                        currentNode = currentNode.firstChild;

                        while (currentNode.textContent.length + totalOffset < charOffset) {
                            totalOffset += currentNode.textContent.length;
                            currentNode = currentNode.nextSibling;
                        }

                        continue;
                    } else {
                        totalOffset += nodeLength;
                    }
                }

                currentNode = currentNode.nextSibling;
            }

            if (foundNode) {
                const start = charOffset - totalOffset;

                range.setStart(foundNode, start);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    highlightCode() {
        setTimeout(() => {
            const state = getState();

            const collapsedMode = state.getCollapsedMode();
            const showPreview = state.getShowPreview();

            if (collapsedMode && showPreview) {
                return;
            }

            const fileIndex = state.getEditIndex();
            let code = this.fileService.getFileData(fileIndex);
            const textAreaEle = document.getElementById('tryit-sling-div');
            textAreaEle.textContent = code;

            if (this.hljs === null) {
                import(
                    '../../../js/highlight'
                ).then((module) => {
                    this.hljs = module;
                    this.hljs.highlightElement(textAreaEle);
                });
            } else {
                this.hljs.highlightElement(textAreaEle);
            }

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
            const contentLength = content.length;// + content.split('\n').length;

            if (contentLength === caretPos) {
                if (content.endsWith('\n')) {
                    content = content.substring(0, caretPos) + '\n';
                } else {
                    content = content.substring(0, caretPos) + '\n\n';
                }
            } else {
                let before = content.substring(0, caretPos);
                // const newlineCount = (before.split('\n').length - 1);
                // before = before.substring(0, before.length - newlineCount);
                content = before + '\n' + content.substring(caretPos);// - newlineCount);
            }
            event.target.textContent = content;
            caretPos++;
        }

        state.getDismissSuggestionSubject().next(true);
        state.setCaretPositionToRestore(caretPos);
        setState(state);

        const fileIndex = state.getEditIndex();
        this.fileService.updateFileData(fileIndex, event.target.textContent);
        this.highlightCode();

        const caretRestore = state.getCaretPositionToRestore();
        this.setCurrentCursorPosition(caretRestore);
    }

    view() {
        const state = getState();
        const fileIndex = state.getEditIndex();
        const file = this.fileService.getFile(fileIndex);
        const fileList = this.fileService.getFileList();
        const fileListLength = fileList ? fileList.length : 0;

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 26px Arial;';
        }

        font += ' filter: brightness(190%);'

        return markup('div', {
            attrs: {
                style: 'padding: 0.25rem; background-color: rgb(21, 24, 30); color: rgb(204, 204, 204); height: calc(100% - 0.5rem); display: flex; flex-direction: column;'
            },
            children: [
                markup('h4', {
                    attrs: {
                        style: 'margin: 0px; flex-shrink: 1;'
                    },
                    children: [
                        ...(file ? [
                            textNode('File ' + (file.index + 1) + ': ' + file.name)
                        ] : []),
                    ]
                }),
                markup('div', {
                    attrs: {
                        style: 'width: 100%; background-color: rgb(0, 0, 0); border: none; color: rgb(204, 204, 204); flex: 19; white-space: pre; overflow: auto; padding: 0.25rem;' + font,
                        oninput: this.onInput.bind(this),
                        autocorrect: 'off',
                        autocomplete: 'off',
                        spellcheck: 'false',
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
