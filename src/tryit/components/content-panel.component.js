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
        this.helpComp = new HelpComponent();
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
        const portraitMode = state.getPortraitMode();
        
        let rootDisplayStyle = 'display: flex;';
        let fileTreeStyle = 'width: 12%;';
        
        if (portraitMode) {
            rootDisplayStyle = 'display: block;'
            fileTreeStyle = 'width: 100%;';
        }
        
        return markup('div', {
            children: [
                markup('div', {
                    attrs: {
                        style: rootDisplayStyle + ' justify-content: flex-start;' + heightStr
                    },
                    children: [
                        markup('div', {
                            attrs: {
                                style: fileTreeStyle + ' min-width: 100px; max-height: inherit;'
                            },
                            children: [
                                this.fileTreeComp
                            ]
                        }),
                        ...(portraitMode === false ? [
                            ...(showHelp === false ? [
                                ...(collapsedMode === false ? [
                                    markup('div', {
                                        attrs: {
                                            style: 'width: 44%; max-height: inherit; height: calc(200% - 1rem);'
                                        },
                                        children: [
                                            this.sourceComp
                                        ]
                                    }),
                                    markup('div', {
                                        attrs: {
                                            style: 'width: 44%; max-height: inherit;  height: calc(200% - 1rem);'
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
                                                style: 'width: calc(100% - max(12%, 100px)); max-height: inherit;  height: calc(200% - 1rem);'
                                            },
                                            children: [
                                                this.previewComp
                                            ]
                                        })
                                    ] : []),
                                    ...(showPreview === false ? [
                                        markup('div', {
                                            attrs: {
                                                style: 'width: calc(100% - max(12%, 100px) - 0.5rem); max-height: inherit;  height: calc(200% - 1rem);'
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
                                        style: 'width: calc(100% - max(12%, 100px)); max-height: inherit;  height: calc(200% - 1rem);'
                                    },
                                    children: [
                                        this.helpComp
                                    ]
                                })
                            ]),
                        ] : [
                            ...(showHelp === false ? [
                                ...(collapsedMode === false ? [
                                    markup('div', {
                                        attrs: {
                                            style: 'width: 100%; max-height: inherit;  height: calc(200% - 1rem);'
                                        },
                                        children: [
                                            this.sourceComp
                                        ]
                                    }),
                                    markup('div', {
                                        attrs: {
                                            style: 'width: 100%; max-height: inherit;  height: calc(200% - 1rem);'
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
                                                style: 'width: calc(100% - max(12%, 100px)); max-height: inherit;  height: calc(200% - 1rem);'
                                            },
                                            children: [
                                                this.previewComp
                                            ]
                                        })
                                    ] : []),
                                    ...(showPreview === false ? [
                                        markup('div', {
                                            attrs: {
                                                style: 'width: calc(100% - max(12%, 100px) - 0.5rem); max-height: inherit;  height: calc(200% - 1rem);'
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
                                        style: 'width: calc(100% - max(12%, 100px)); max-height: inherit;  height: calc(200% - 1rem);'
                                    },
                                    children: [
                                        this.helpComp
                                    ]
                                })
                            ]),
                        ])
                    ]
                })
            ]
        });
    }
}

export default ContentPanelComponent;
