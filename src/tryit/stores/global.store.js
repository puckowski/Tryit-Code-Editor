import { BehaviorSubject } from '../../../dist/sling-reactive.min';

export const SCRIPT_VALIDITY_CHECK_SOURCE = 'let slTryItCount = Number(localStorage.getItem(\'tryitCount\')); slTryItCount++; localStorage.setItem(\'tryitCount\', slTryItCount);';

class StoreGlobal {
    constructor() {
        this.editIndex = 0;
        this.dataUpdated = BehaviorSubject(false);
        this.heightModifier = 0;
        this.inlineHeight = '';
        this.collapsedMode = false;
        this.showPreview = false;
        this.version = '2.2';
        this.showHelp = false;
        this.sourceHasNewInput = BehaviorSubject(false);
        this.invalidScriptIndices = BehaviorSubject([]);
        this.caretPositionToRestore = 0;
        this.preserveFocus = false;
    }

    setPreserveFocus(preserveState) {
        this.preserveFocus = preserveState;
    }

    getPreserveFocus() {
        return this.preserveFocus;
    }

    getCaretPositionToRestore() {
        return this.caretPositionToRestore;
    }

    setCaretPositionToRestore(position) {
        this.caretPositionToRestore = position;
    }
    
    getInvalidScriptIndexSubject() {
        return this.invalidScriptIndices;
    }

    getShowHelp() {
        return this.showHelp;
    }

    setShowHelp(helpState) {
        this.showHelp = helpState;
    }

    getVersion() {
        return this.version;
    }

    getShowPreview() {
        return this.showPreview;
    }

    setShowPreview(newShowPreview) {
        this.showPreview = newShowPreview;
    }

    getCollapsedMode() {
        return this.collapsedMode;
    }

    setCollapsedMode(newMode) {
        this.collapsedMode = newMode;
    }

    getInlineHeight() {
        return this.inlineHeight;
    }

    setInlineHeight(inlineHeight) {
        this.inlineHeight = inlineHeight;
    }

    getSourceHasNewInputSubject() {
        return this.sourceHasNewInput;
    }

    getDataSubject() {
        return this.dataUpdated;
    }

    getEditIndex() {
        return this.editIndex;
    }

    setEditIndex(newIndex) {
        this.editIndex = newIndex;
    }

    getHeightModifier() {
        return this.heightModifier;
    }

    setHeightModifier(newModifier) {
        this.heightModifier = newModifier;
    }
}

export default StoreGlobal;
