import { getState } from "../../../dist/sling.min";

class FileService {

    constructor() {
        this.SLING_DEMO_HTML =
        '<html>' +
        '<body>' +
        '<div id="divRouterOutlet"></div>' +
        '</body>' +
        '</html>';

        this.SLING_DEMO_CSS = 
        '.visible {\n' + 
        '    animation: fadein 800ms ease-in-out;\n' + 
        '}\n\n' + 
        '.hide {\n' + 
        '    animation: fadeout 800ms ease-in-out;\n' + 
        '}\n\n' + 
        '@keyframes fadein {\n' + 
        '    from {\n' + 
        '        opacity: 0;\n' + 
        '        transform: translateY(-3%);\n' + 
        '    }\n\n' + 
        '    to {\n' + 
        '        opacity: 1;\n' + 
        '        transform: translateY(0%);\n' + 
        '    }\n' + 
        '}\n\n' + 
        '@keyframes fadeout {\n' + 
        '    from {\n' + 
        '        opacity: 1;\n' + 
        '        transform: translateY(0%);\n' + 
        '    }\n\n' + 
        '    to {\n' + 
        '        opacity: 0;\n' + 
        '        transform: translateY(3%);\n' + 
        '    }\n' + 
        '}';

        this.SLING_DEMO_JAVASCRIPT = `
        import {
          textNode,
          markup,
          addRoute,
          route
        } from "https://cdn.jsdelivr.net/npm/slingjs@18.0.0/sling.min.js";
                    
        class HideComponent {
          hideWelcome() {
            route("show");
          }
          
          slDetachedOnNodeDestroy(node) {
            return node;
          }
          
          view() {
            return markup("div", {
              attrs: {
                id: "divRouterOutlet",
                class: "visible",
                style:
                  "display: flex; justify-content: center; align-items: center; height: 100%;",
                slanimatedestroy: "hide",
                slanimatedestroytarget: this.slDetachedOnNodeDestroy.bind(this)
              },
              children: [
                markup("h1", {
                  children: [
                    textNode("Hello, world!"),
                    markup("button", {
                      attrs: {
                        onclick: this.hideWelcome.bind(this)
                      },
                      children: [textNode("Hide")]
                    })
                  ]
                })
              ]
            });
          }
        }
          
        class ShowComponent {
          hideWelcome() {
            route("hide");
          }
          
          slDetachedOnNodeDestroy(node) {
            return node;
          }
          
          view() {
            return markup("div", {
              attrs: {
                id: "divRouterOutlet",
                class: "visible",
                style:
                  "display: flex; justify-content: center; align-items: center; height: 100%;",
                slanimatedestroy: "hide",
                slanimatedestroytarget: this.slDetachedOnNodeDestroy.bind(this)
              },
              children: [
                markup("h1", {
                  children: [
                    markup("button", {
                      attrs: {
                        onclick: this.hideWelcome.bind(this)
                      },
                      children: [textNode("Show")]
                    })
                  ]
                })
              ]
            });
          }
        }
          
        addRoute("hide", {
          component: new HideComponent(),
          root: "divRouterOutlet",
          animateDestroy: true
        });
        addRoute("show", {
          component: new ShowComponent(),
          root: "divRouterOutlet",
          animateDestroy: true
        });
          
        route("hide");
        `;

        this.fileListObject = 'filelist';
        this.initializeFileList();
    }

    buildSlingDemo() {
        const fileList = this.getFileList();
        const length = fileList.length;
        this.addFile(this.SLING_DEMO_HTML, false, false);
        this.setFileName(length, 'Sling Demo HTML');
        this.addFile(this.SLING_DEMO_CSS, false, true);
        this.setFileName(length + 1, 'Sling Demo CSS');
        this.addFile(this.SLING_DEMO_JAVASCRIPT, true, false);
        this.setFileName(length + 2, 'Sling Demo JavaScript');
        return length;
    }

    getFile(index) {
        const fileList = this.getFileList();
        return fileList.find(file => file.index === index);
    }

    getFileData(index) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);

        if (file) {
            return file.data;
        }

        return '';
    }

    getFileList() {
        const data = localStorage.getItem(this.fileListObject);
        return JSON.parse(data);
    }

    addFile(data = null, injectScript = false, injectCss = false) {
        const fileList = this.getFileList();

        let nextFree = 0;
        const usedIndices = new Set(fileList.map(file => file.index));
        while (usedIndices.has(nextFree)) {
            nextFree++;
        }

        const fileObj = this.getFileObject(nextFree);

        if (data !== null && data !== undefined) {
            fileObj.data = data;
            fileObj.injectScript = injectScript;
            fileObj.injectCss = injectCss;
        }

        fileList.push(fileObj);
        this.setFileList(fileList);
    }

    removeFile(index) {
        let fileList = this.getFileList();
        fileList = fileList.filter(file => file.index !== index);
        this.setFileList(fileList);
    }

    updateFileData(index, data) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);
        if (file) file.data = data;
        this.setFileList(fileList);

        const state = getState();
        const sourceSubject = state.getSourceHasNewInputSubject();
        sourceSubject.next(true);
    }

    updateFileInject(index, value = null) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);
        if (file) {
            if (!file.injectScript) {
                if (value === null || value === undefined) {
                    file.injectScript = true;
                    file.injectCss = false;
                } else {
                    file.injectScript = value;
                    file.injectCss = !value;
                }
            } else {
                if (value === null || value === undefined) {
                    file.injectScript = !file.injectScript;
                    file.injectCss = !file.injectScript;
                } else {
                    file.injectScript = value;
                    file.injectCss = !value;
                }
            }
        }
        this.setFileList(fileList);
    }

    updateFileInjectCss(index, value = null) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);
        if (file) {
            if (!file.injectCss) {
                if (value === null || value === undefined) {
                    file.injectCss = true;
                    file.injectScript = false;
                } else {
                    file.injectCss = value;
                    file.injectScript = !value;
                }
            } else {
                if (value === null || value === undefined) {
                    file.injectCss = !file.injectCss;
                    file.injectScript = !file.injectCss;
                } else {
                    file.injectCss = value;
                    file.injectScript = !value;
                }
            }
        }
        this.setFileList(fileList);
    }

    setFileName(index, name) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);
        if (file) file.name = name;
        this.setFileList(fileList);
    }

    setFileList(fileList) {
        localStorage.setItem(this.fileListObject, JSON.stringify(fileList));
    }

    getFileObject(fileCount) {
        return {
            name: '',
            index: fileCount,
            data: '',
            injectScript: false,
            injectCss: false
        };
    }

    initializeFileList() {
        const fileList = localStorage.getItem(this.fileListObject);

        if (fileList == null || fileList == undefined) {
            localStorage.setItem(this.fileListObject, JSON.stringify([]));
        } else {
            const data = JSON.parse(fileList);

            if (!Array.isArray(data)) {
                localStorage.setItem(this.fileListObject, JSON.stringify([]));
            }
        }
    }
}

export default FileService;
