import { getState, markup } from '../../../dist/sling.min';
import FileService from '../services/file.service';
import FileTreeComponent from './file-tree.component';
import HelpComponent from './help.component';
import PreviewComponent from './preview.component';
import SourcePanelComponent from './source-panel.component';

class ContentPanelComponent {

    constructor() {
        this.fileService = new FileService();
        this.fileTreeComp = new FileTreeComponent();
        this.previewComp = new PreviewComponent();
        this.sourceComp = new SourcePanelComponent();
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
            const newHeight = mod + 60;
            heightStr = 'max-height: ' + String(newHeight) + 'vh; height: ' + String(newHeight) + 'vh;';
        }

        return heightStr;
    }

    view() {
        const state = getState();
        const inlineHeight = state.getInlineHeight();
        const mod = state.getHeightModifier();
        const heightStr = this.getHeightString(inlineHeight, mod);
        const collapsedMode = state.getCollapsedMode();
        const showPreview = state.getShowPreview();
        const showHelp = state.getShowHelp();
        
        return markup('div', {
            children: [
                markup('div', {
                    attrs: {
                        style: 'display: flex; justify-content: flex-start;' + heightStr
                    },
                    children: [
                        markup('div', {
                            attrs: {
                                style: 'width: 12%; min-width: 100px; max-height: inherit;'
                            },
                            children: [
                                this.fileTreeComp
                            ]
                        }),
                        ...(showHelp === false ? [
                            ...(collapsedMode === false ? [
                                markup('div', {
                                    attrs: {
                                        style: 'width: 44%; max-height: inherit;'
                                    },
                                    children: [
                                        this.sourceComp
                                    ]
                                }),
                                markup('div', {
                                    attrs: {
                                        style: 'width: 44%; max-height: inherit;'
                                    },
                                    children: [
                                        this.previewComp
                                    ]
                                })
                            ] : []),
                            ...(collapsedMode === true ? [
                                ...(showPreview === true ? [
                                    markup('div', {
                                        attrs: {
                                            style: 'width: calc(100% - max(12%, 100px)); max-height: inherit;'
                                        },
                                        children: [
                                            this.previewComp
                                        ]
                                    })
                                ] : []),
                                ...(showPreview === false ? [
                                    markup('div', {
                                        attrs: {
                                            style: 'width: calc(100% - max(12%, 100px) - 0.5rem); max-height: inherit;'
                                        },
                                        children: [
                                            this.sourceComp
                                        ]
                                    })
                                ] : []),
                            ] : [])
                        ] : [
                            markup('div', {
                                attrs: {
                                    style: 'width: calc(100% - max(12%, 100px)); max-height: inherit;'
                                },
                                children: [
                                    new HelpComponent()
                                ]
                            })
                        ]),
                    ]
                })
            ]
        });
    }
}

export default ContentPanelComponent;
