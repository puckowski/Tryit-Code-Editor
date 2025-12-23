import { markup, textNode, getState, mount, setState } from '../../../dist/sling.min';
import { BrowserAI } from '../../js/@browserai_browserai.js';

class ChatComponent {

    constructor() {
        this.browserAI = new BrowserAI();
    }

    async slOnInit() {
        const state = getState();
        const modelId = state.getModelId();
        if (!localStorage.getItem(modelId)) {
            localStorage.setItem(modelId, true);
            await this.browserAI.loadModel('smollm2-135m-instruct', {
                onProgress: (progress) => {
                    // Capture loading progress milestones
                    console.log(`Loading progress: ${progress.progress}%`);
                }
            });
        }
    }

    async processQuestion(event) {
        const question = document.getElementById('tryit-sling-chat').value;
        const chunks = await this.browserAI.generateText(
            'You are a JavaScript expert focused on vanilla JavaScript advice. Do not default to suggesting libraries. Prompt: ' + question, {
            maxTokens: 300,
            temperature: 0.1,
            stream: true,
        });

        let response = '';
        for await (const chunk of chunks) {
            const choice0 = chunk && chunk.choices && chunk.choices[0];
            const newContent = (choice0 && choice0.delta && choice0.delta.content) ? choice0.delta.content : '';
            response += newContent;
            const responseBox = document.getElementById('tryit-sling-response');
            if (responseBox) {
                responseBox.value = response;
            }
        }
    }

    view() {
        const state = getState();

        let font = ' font: 400 13.3333px Arial;';

        if (state.getLowResolution()) {
            font = ' font: 400 26px Arial;';
        }

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
                                textNode('Chat')
                            ]
                        }),
                        markup('textarea', {
                            attrs: {
                                id: 'tryit-sling-chat',
                                sldirective: 'onlyself',
                                style: 'width: 100%; flex: 4; min-height: 100px; background-color: #000000; color: #ffffff; border: none;' + font,
                                placeholder: 'Ask a question...'
                            }
                        }),
                        markup('button', {
                            attrs: {
                                style: 'margin-top: 0.5rem; margin-bottom: 0.5rem; background-color: rgba(255, 255, 255, 0.3); border: none; color: rgb(204, 204, 204);' + font, 
                                onclick: this.processQuestion.bind(this)
                            },
                            children: [
                                textNode('Ask')
                            ],
                        }),
                        markup('textarea', {
                            attrs: {
                                id: 'tryit-sling-response',
                                sldirective: 'onlyself',
                                style: 'width: 100%; flex: 4; min-height: 400px; background-color: #000000; color: #ffffff; border: none;' + font, 
                            }
                        }),
                    ]
                })
            ]
        });
    }
}

export default ChatComponent;
