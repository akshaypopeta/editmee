const pdfjsLib = window.pdfjsLib;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
/**
 * PDFLoader
 * Handles loading PDF files and providing access to pages.
 */
class PDFLoader {

    constructor() {
        this.pdfDocument = null;
    }

    /**
     * Loads a PDF file.
     * @param {File} file
     * @returns {Promise<Object>}
     */
    async load(file) {

        if (!file) {
            throw new Error("No PDF file was provided.");
        }

        const arrayBuffer = await file.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer
        });

        this.pdfDocument = await loadingTask.promise;

        return this.pdfDocument;
    }

    /**
     * Returns the loaded PDF document.
     */
    getDocument() {

        return this.pdfDocument;
    }

    /**
     * Returns total number of pages.
     */
    getPageCount() {

        if (!this.pdfDocument) {
            return 0;
        }

        return this.pdfDocument.numPages;
    }

    /**
     * Returns a specific page.
     * @param {number} pageNumber
     */
    async getPage(pageNumber) {

        if (!this.pdfDocument) {
            throw new Error("No PDF has been loaded.");
        }

        return await this.pdfDocument.getPage(pageNumber);
    }

    /**
     * Clears the loaded document.
     */
    reset() {

        this.pdfDocument = null;
    }

}

const pdfLoader = new PDFLoader();

export default pdfLoader;