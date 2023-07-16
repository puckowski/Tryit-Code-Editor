import { getState, markup, textNode } from '../../../dist/sling.min';

export class ShareDialogComponent {

    constructor(link) {
        this.link = link;
        this.MAX_SHARE_URL_LENGTH = 65000;
    }

    slAfterInit() {
        const root = document.getElementById('tryit-sling-share');
        root.showModal();
    }

    onClose() {
        const root = document.getElementById('tryit-sling-share');
        root.close();
    }

    onCopy() {
        const root = document.getElementById('tryit-sling-share');
        root.close();

        const state = getState();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 26px Arial;';
        }

        if (this.link && this.link.length > this.MAX_SHARE_URL_LENGTH) {
            this.showToast('Failed to copy link. Too much code.', font);
        } else {
            navigator.clipboard.writeText(this.link)
                .then(() => {
                    this.showToast('Link copied.', font);
                })
                .catch((error) => {
                    this.showToast('Failed to copy link.', font);
                });
        }
    }

    showToast(message, font) {
        const toastContainer = document.getElementById('tryit-sling-toast');

        toastContainer.innerText = message;
        toastContainer.style.display = 'block';
        toastContainer.style.font = font;

        s.DETACHED_SET_TIMEOUT(() => {
            toastContainer.style.display = 'none';
        }, 4000);
    }

    view() {
        const state = getState();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 26px Arial;';
        }

        return markup('dialog', {
            attrs: {
                id: 'tryit-sling-share',
                style: 'position: fixed; max-width: 75%; max-height: 75%; margin: auto auto;' + font,
            },
            children: [
                markup('p', {
                    children: [
                        textNode('Shareable link:')
                    ]
                }),
                textNode(this.link),
                markup('button', {
                    attrs: {
                        onclick: this.onCopy.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(0,0,0,0.7); border: none; color: rgb(255, 255, 255); margin-right: 0.5rem; margin-top: 0.5rem; align-self: center; padding: 1px 6px;' + font
                    }, children: [
                        textNode('Copy')
                    ]
                }),
                markup('button', {
                    attrs: {
                        onclick: this.onClose.bind(this),
                        style: 'margin-bottom: 0.25rem; background-color: rgba(0,0,0,0.7); border: none; color: rgb(255, 255, 255); align-self: center; padding: 1px 6px;' + font
                    }, children: [
                        textNode('Close')
                    ]
                })
            ]
        });
    }
}

export default ShareDialogComponent;
