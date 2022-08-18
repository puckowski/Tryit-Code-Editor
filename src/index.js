import { mount, setState } from "../dist/sling.min";
import TryitEditorComponent from "./tryit/components/tryit-editor.component";
import ScreenService from "./tryit/services/screen.service";
import StoreGlobal from "./tryit/stores/global.store";
import { slRequest } from "../dist/sling-xhr.min";

const storeGlobal = new StoreGlobal();
setState(storeGlobal);

const screenService = new ScreenService();
screenService.addResizeListener();

mount('tryit-root', new TryitEditorComponent());

s.DETACHED_SET_TIMEOUT(() => {
    slRequest('https://adakdcfjergwmgmcgtkg.functions.supabase.co/select-from-table-with-auth-rls',
        'POST', {
        contentType: 'application/json',
        timeout: 20000,
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYWtkY2ZqZXJnd21nbWNndGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjAzMDk0NDQsImV4cCI6MTk3NTg4NTQ0NH0.jWdEVzC9ilf3OzyFroEuCkyc3vqlirB2X8IIvINNQD4'
        }
    });
}, 30000);
