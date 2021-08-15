import { getState, markup, textNode, version } from '../../../dist/sling.min';
import FileService from '../services/file.service';
import FileTreeComponent from './file-tree.component';
import PreviewComponent from './preview.component';
import SourcePanelComponent from './source-panel.component';

class ContentPanelComponent {

    constructor() {
        this.fileService = new FileService();
        this.fileTreeComp = new FileTreeComponent();
        this.previewComp = new PreviewComponent();
    }

    view() {
        const state = getState();
        const mod = state.getHeightModifier();
        const newHeight = mod + 50;
        const heightStr = 'max-height: ' + String(newHeight) + 'vh; height: ' + String(newHeight) + 'vh;';

        return markup('div', {
            children: [
                markup('div', {
                    attrs: {
                        style: 'display: flex; justify-content: space-between;' + heightStr
                    },
                    children: [
                        markup('div', {
                            attrs: {
                                style: 'width: 16%; max-height: inherit;'
                            },
                            children: [
                                this.fileTreeComp
                            ]
                        }),
                        markup('div', {
                            attrs: {
                                style: 'width: 42%; max-height: inherit;'
                            },
                            children: [
                                new SourcePanelComponent()
                            ]
                        }),
                        markup('div', {
                            attrs: { 
                                style: 'width: 42%; max-height: inherit;'
                            },
                            children: [
                                this.previewComp
                            ]
                        })
                    ]
                })
            ]
        });
    }
}

export default ContentPanelComponent;
