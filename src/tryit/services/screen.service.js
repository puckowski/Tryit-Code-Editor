import { detectChanges, getState, setState } from "../../../dist/sling.min";

class ScreenService {

    constructor() {
        this.COLLAPSED_MODE_WIDTH = 768;
    }

    onWindowResize() {
        const state = getState();

        const resolution = window.outerHeight * window.outerWidth;

        if (resolution < 1152000) {
            state.setLowResolution(true);
        } else {
            state.setLowResolution(false);
        }

        if (window.outerWidth < window.outerHeight) {
            state.setPortraitMode(true);
            state.setCollapsedMode(false);
        } else if (window.outerWidth <= this.COLLAPSED_MODE_WIDTH) {
            state.setCollapsedMode(true);
            state.setPortraitMode(false);
        } else {
            state.setCollapsedMode(false);
            state.setPortraitMode(false);
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
