import { BehaviorSubject } from '../../../dist/sling-reactive.min';

class StoreGlobal {
    constructor() {
        this.editIndex = 0;
        this.dataUpdated = BehaviorSubject(false);
        this.heightModifier = 0;
        this.inlineHeight = '';
        this.collapsedMode = false;
        this.showPreview = false;
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
