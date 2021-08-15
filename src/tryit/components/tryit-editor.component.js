import { getState, m, markup, setState, textNode, version } from '../../../dist/sling.min';
import ContentPanelComponent from './content-panel.component';
import NavbarComponent from './navbar.component';

class TryitEditorComponent {

    constructor() {
        this.contentPanelComp = new ContentPanelComponent();
    }

    slOnInit() {
        const tryitRootEle = document.getElementById('tryit-root');
        const tryitHeight = tryitRootEle.style.height;
        const state = getState();
        state.setInlineHeight(tryitHeight);
        setState(state);
    }

    view() {
        return markup('div', {
           attrs: {
               id: 'tryit-root',
               style: 'background-color: rgb(21, 24, 30); width: 100%;'
           },
           children: [
               new NavbarComponent(),
               this.contentPanelComp
           ]
        });
    }
}

export default TryitEditorComponent;
