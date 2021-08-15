class FileService {

    constructor() {
        this.fileListObject = 'filelist';
        this.initializeFileList();
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

    addFile() {
        const fileList = this.getFileList();

        let nextFree = 0;
        const usedIndices = new Set(fileList.map(file => file.index));
        while (usedIndices.has(nextFree)) {
            nextFree++;
        }

        fileList.push(this.getFileObject(nextFree));
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
    }

    updateFileInject(index) {
        const fileList = this.getFileList();
        const file = fileList.find(file => file.index === index);
        if (file) {
            if (!file.injectScript) {
                file.injectScript = true;
            } else {
                file.injectScript = !file.injectScript;
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
            injectScript: false
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
