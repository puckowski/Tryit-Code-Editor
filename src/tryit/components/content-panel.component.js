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
        this.unitList = [
            'cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%'
        ];
    }

    getHeightString(inlineHeight, mod) {
        let heightStr = '';

        if (inlineHeight && inlineHeight.length > 0) {
            let heightNumberStr = inlineHeight;
            this.unitList.forEach(unitStr => {
                heightNumberStr = heightNumberStr.replace(unitStr, '');
            });
            const heightNumber = Number(heightNumberStr);
            const modifiedHeight = heightNumber + (mod * (heightNumber / 100));
            const unitStr = inlineHeight.replace(heightNumberStr, '');
            const finalValue = String(modifiedHeight) + unitStr;

            heightStr = 'max-height: ' + finalValue + '; height: ' + finalValue + ';';
        } else {
            const newHeight = mod + 50;
            heightStr = 'max-height: ' + String(newHeight) + 'vh; height: ' + String(newHeight) + 'vh;';
        }

        return heightStr;
    }

    view() {
        const state = getState();
        const inlineHeight = state.getInlineHeight();
        const mod = state.getHeightModifier();
        const heightStr = this.getHeightString(inlineHeight, mod);

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
