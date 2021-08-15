import { mount, setState } from "../dist/sling.min";
import TryitEditorComponent from "./tryit/components/tryit-editor.component";
import StoreGlobal from "./tryit/stores/global.store";

const storeGlobal = new StoreGlobal();
setState(storeGlobal);

mount('tryit-root', new TryitEditorComponent());
