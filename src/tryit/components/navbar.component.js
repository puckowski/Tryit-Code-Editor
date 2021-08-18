import { getState, markup, setState, textNode, version } from '../../../dist/sling.min';
import FileService from '../services/file.service';

class NavbarComponent {

    constructor() {
        this.fileService = new FileService();
    }

    addFile() {
        this.fileService.addFile();
    }

    expandHeight() {
        const state = getState();
        let mod = state.getHeightModifier();
        mod += 10;
        state.setHeightModifier(mod);
        setState(state);
    }

    shrinkHeight() {
        const state = getState();
        let mod = state.getHeightModifier();
        mod -= 10;
        state.setHeightModifier(mod);
        setState(state);
    }

    onRun() {
        const state = getState();
        state.getDataSubject().next(true);
    }

    onClearConsole() {
        const consoleEle = document.getElementById('tryit-sling-console');
        if (consoleEle) {
            consoleEle.value = '';
        }
    }

    view() {
        const state = getState();
        const mod = state.getHeightModifier();

        return markup('div', {
            attrs: {
                style: 'padding: 0.5rem; background-color: rgb(46, 49, 56); display: flex; flex-direction: row;'
            },
            children: [
                markup('div', {
                    attrs: {
                        style: 'margin-right: 0.5rem; display: inline-block; color: rgb(204, 204, 204) !important; align-self: center;'
                    },
                    children: [
                        markup('h4', {
                            attrs: {
                                style: 'margin: 0px;'
                            },
                            children: [
                                textNode('Code Editor')
                            ]
                        })
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.addFile.bind(this),
                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center;'
                    },
                    children: [
                        textNode('Add File')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.expandHeight.bind(this),
                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center;'
                    },
                    children: [
                        textNode('Expand')
                    ]
                }),
                ...(mod > 0 ? [
                    markup('button', {
                        attrs: {
                            onclick: this.shrinkHeight.bind(this),
                            style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center;'
                        },
                        children: [
                            textNode('Shrink')
                        ]
                    })
                ] : []),
                markup('button', {
                    attrs: {
                        onclick: this.onRun.bind(this),
                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); margin-right: 0.5rem; align-self: center;'
                    },
                    children: [
                        textNode('Run')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.onClearConsole.bind(this),
                        style: 'background-color: rgba(255,255,255,0.3); border: none; color: rgb(204, 204, 204); align-self: center;'
                    },
                    children: [
                        textNode('Clear Console')
                    ]
                })
            ]
        });
    }
}

export default NavbarComponent;
