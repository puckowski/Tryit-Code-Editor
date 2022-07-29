import { detectChanges, getState, setState } from "../../../dist/sling.min";

class ScreenService {

    constructor() {
        this.COLLAPSED_MODE_WIDTH = 768;
        this.LOW_RESOLUTION_AREA = 1152000;
        this.lastWindowWidth = null;
    }

    onWindowResize() {
        if (this.lastWindowWidth === window.outerWidth) {
            return;
        }

        this.lastWindowWidth = window.outerWidth;

        const state = getState();

        const resolution = window.outerHeight * window.outerWidth;

        if (resolution <= this.LOW_RESOLUTION_AREA) {
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
