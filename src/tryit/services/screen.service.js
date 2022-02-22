import { detectChanges, getState, setState } from "../../../dist/sling.min";

class ScreenService {

    constructor() {
        this.COLLAPSED_MODE_WIDTH = 768;
    }

    onWindowResize() {
        const state = getState();

        if (window.outerWidth <= this.COLLAPSED_MODE_WIDTH) {
            state.setCollapsedMode(true);
        } else {
            state.setCollapsedMode(false);
        }

        s.DETACHED_SET_TIMEOUT(() => {
            state.getDataSubject().next(true);
        }, 0);
        
        setState(state);
        detectChanges();
    }

    addResizeListener() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.onWindowResize();
    }
}

export default ScreenService;
