import { BehaviorSubject } from '../../../dist/sling-reactive.min';

class StoreGlobal {
    constructor() {
        this.editIndex = 0;
        this.dataUpdated = BehaviorSubject(false);
        this.heightModifier = 0;
        this.inlineHeight = '';
        this.collapsedMode = false;
        this.showPreview = false;
        this.version = '1.3';
        this.showHelp = false;
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
