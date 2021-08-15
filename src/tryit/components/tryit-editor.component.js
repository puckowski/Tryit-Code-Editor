import { m, markup, textNode, version } from '../../../dist/sling.min';
import ContentPanelComponent from './content-panel.component';
import NavbarComponent from './navbar.component';

class TryitEditorComponent {

    constructor() {
        this.contentPanelComp = new ContentPanelComponent();
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
