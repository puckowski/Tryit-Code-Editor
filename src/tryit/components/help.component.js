import { markup, textNode } from '../../../dist/sling.min';

class HelpComponent {

    constructor() {
    }

    view() {
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
                                textNode('Click Sling.js Demo to build a \'Hello, world!\' Sling.js project.')
                            ]
                        })
                    ]
                })
            ]
        });
    }
}

export default HelpComponent;