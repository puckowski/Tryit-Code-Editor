import { markup, textNode, getState, mount } from '../../../dist/sling.min';
import ResetDialogComponent from './reset-dialog.component';

class HelpComponent {

    constructor() {
    }

    onReset() {
        mount('tryit-sling-reset', new ResetDialogComponent(), s.CHANGE_DETECTOR_DETACHED);
    }

    view() {
        const state = getState();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 26px Arial;';
        }

        return markup('div', {
            attrs: {
                style: 'padding: 0.25rem; background-color: rgb(21, 24, 30); color: rgb(204, 204, 204); overflow: auto; height: calc(100% - 0.5rem); display: flex; flex-direction: column;'
            },
            children: [
                markup('div', {
                    attrs: {
                        style: 'flex: 20;'
                    },
                    children: [
                        markup('h4', {
                            attrs: {
                                style: 'margin: 0px;'
                            },
                            children: [
                                textNode('Code Editor Help')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Add File to add a new file. Toggle Inject Script to inject the file as a <script> tag in the <head> of the preview. Toggle Inject CSS to inject the file as a <style> tag in the <head> of the preview.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Expand and Shrink to change the size of the Code Editor.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Run to update the preview.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Export to export the preview page HTML.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Import File to import a file\'s contents into the source panel.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Import Workspace to import a previously exported HTML file. This may create multiple files.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Toggle Preview on small screens to toggle the preview.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Clear Console to clear the preview console.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Format Code to format the code in the file editor.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Toggle Mode to toggle collapsed editor mode.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Click Sling.js Demo to build a \'Hello, world!\' Sling.js project.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Press Control/Command and A or click on the suggested word popup to insert the suggested word.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Press Control/Command and J simultaneously to format your code. Press Control/Command and H simultaneously to run your code.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('The Share feature is limited to links that are 6,237 characters or less.')
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('A custom build of Less.js 4.1.3 is used that supports CSS Container Queries, Media Queries Level 4, and Cascading and Inheritance Level 6. '),
                                markup('a', {
                                    attrs: {
                                        href: 'https://github.com/puckowski/less.js'
                                    },
                                    children: [
                                        textNode('https://github.com/puckowski/less.js')
                                    ]
                                })
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('Ness.js 1.5.0 supports SCSS-style CSS nesting, nested @media, and nested @layer queries. '),
                                markup('a', {
                                    attrs: {
                                        href: 'https://github.com/puckowski/Ness.js'
                                    },
                                    children: [
                                        textNode('https://github.com/puckowski/Ness.js')
                                    ]
                                })
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('To reset Code Editor to original state, click the following button.'),
                            ]
                        }),
                        markup('div', {
                            children: [
                                markup('button', {
                                    attrs: {
                                        onclick: this.onReset.bind(this),
                                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); align-self: center;' + font
                                    },
                                    children: [
                                        textNode('Reset')
                                    ]
                                })
                            ]
                        }),
                        markup('p', {
                            children: [
                                textNode('If you encounter any issues, please log an issue on GitHub: '),
                                markup('a', {
                                    attrs: {
                                        href: 'https://github.com/puckowski/Tryit-Code-Editor'
                                    },
                                    children: [
                                        textNode('https://github.com/puckowski/Tryit-Code-Editor')
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }
}

export default HelpComponent;
