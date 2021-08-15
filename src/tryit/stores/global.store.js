import { BehaviorSubject } from '../../../dist/sling-reactive.min';

class StoreGlobal {
    constructor() {
        this.editIndex = 0;
        this.dataUpdated = BehaviorSubject(false);
        this.heightModifier = 0;
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
