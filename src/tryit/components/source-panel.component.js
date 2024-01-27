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
                range.setEnd(node, node.childNodes.length);
                chars.count = 0;
            }
        }

        return range;
    }

    setCaretPosition(el, charOffset) {
        const range = document.createRange();
        const sel = window.getSelection();
        let currentNode = el.firstChild;
        let totalOffset = 0;
        let newlinesBeforeMatchingNode = 0;
        let newlinesInCurrentNode = 0;
        let foundNode = null;
        let lastNode = null;

        while (currentNode) {
            if (currentNode.nodeType === Node.TEXT_NODE) {
                const nodeLength = currentNode.length;
                if (totalOffset + nodeLength >= charOffset) {
                    newlinesInCurrentNode = currentNode.textContent.split('\n').length;
                    foundNode = currentNode;
                    break;
                } else {
                    totalOffset += nodeLength;
                }
                newlinesBeforeMatchingNode += currentNode.textContent.split('\n').length - 1;
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                // Skip elements, adjust offset accordingly
                const textContent = currentNode.textContent;
                const nodeLength = textContent.length;
                if (totalOffset + nodeLength >= charOffset) {
                    newlinesInCurrentNode = currentNode.textContent.split('\n').length;
                    currentNode = currentNode.firstChild;
                    while (currentNode.textContent.length + totalOffset < charOffset) {
                        totalOffset += currentNode.textContent.length;
                        currentNode = currentNode.nextSibling;
                    }

                    continue;
                } else {
                    totalOffset += nodeLength;
                }
                newlinesBeforeMatchingNode += textContent.split('\n').length - 1;
            }
            lastNode = currentNode;
            currentNode = currentNode.nextSibling;
        }

        if (foundNode) {
            let start = charOffset - (totalOffset);//+ newlinesBeforeMatchingNode);
            let str = currentNode.textContent.substring(0, start);
            newlinesInCurrentNode = str.split('\n').length - 1;
            let newlinesInCurrentNode2 = str.endsWith('\n') ? 1 : 0;
            if ((newlinesInCurrentNode - newlinesInCurrentNode2) === 0 && start > 0 && str !== '\n') {
                // start--;
            }

            range.setStart(foundNode, start);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (lastNode) {
            let start = lastNode.length - (charOffset - totalOffset);

            if (start < 0) {
                start = Math.ceil(Math.abs(start) / 2);
            }

            range.setStart(lastNode, start);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    setCurrentCursorPosition(charCount) {
        if (charCount >= 0) {
            const el = document.getElementById('tryit-sling-div');
            this.setCaretPosition(el, charCount);
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
