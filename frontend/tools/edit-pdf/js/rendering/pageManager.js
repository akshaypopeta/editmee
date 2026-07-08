/* ==========================================================
   EDITMEE
   FILE : rendering/pageManager.js
   PURPOSE :
   Centralized state manager for all PDF pages.
   Does NOT render pages.
==========================================================*/

export default class PageManager {

    constructor() {

        // PDF document
        this.pdfDocument = null;

        // Total pages
        this.pageCount = 0;

        // Current page visible to user
        this.currentPage = 1;

        // Current zoom level
        this.scale = 1;

        /*
        Page Map

        key   -> page number

        value ->
        {
            pageNumber,
            pdfPage,
            viewport,
            container,
            canvas,
            context,
            renderTask,
            status,
            isVisible
        }
        */

        this.pages = new Map();

    }

    /* ==========================================================
       PDF
    ========================================================== */

    setDocument(pdfDocument) {

        this.pdfDocument = pdfDocument;
        this.pageCount = pdfDocument.numPages;

    }

    getDocument() {

        return this.pdfDocument;

    }

    getPageCount() {

        return this.pageCount;

    }

    /* ==========================================================
       CURRENT PAGE
    ========================================================== */

    setCurrentPage(pageNumber) {

        this.currentPage = pageNumber;

    }

    getCurrentPage() {

        return this.currentPage;

    }

    /* ==========================================================
       SCALE
    ========================================================== */

    setScale(scale) {

        this.scale = scale;

    }

    getScale() {

        return this.scale;

    }

    /* ==========================================================
       PAGE OBJECT
    ========================================================== */

    createPage(pageNumber) {

        if (this.pages.has(pageNumber)) {
            return this.pages.get(pageNumber);
        }

      const page = {

    pageNumber,

    pdfPage: null,

    viewport: null,

    container: null,

    canvas: null,

    context: null,

    renderTask: null,

    status: "idle",

    isVisible: false,

    lastVisible: 0,

    lastRenderTime: 0,

    renderScale: 0

};
        this.pages.set(pageNumber, page);

        return page;

    }

    getPage(pageNumber) {

        return this.pages.get(pageNumber);

    }

    hasPage(pageNumber) {

        return this.pages.has(pageNumber);

    }

    getPages() {

        return this.pages;

    }

    clearPages() {

        this.pages.clear();

    }

    /* ==========================================================
       PAGE DATA
    ========================================================== */

    setPdfPage(pageNumber, pdfPage) {

        this.createPage(pageNumber).pdfPage = pdfPage;

    }

    setViewport(pageNumber, viewport) {

        this.createPage(pageNumber).viewport = viewport;

    }

    setContainer(pageNumber, container) {

        this.createPage(pageNumber).container = container;

    }

    setCanvas(pageNumber, canvas) {

        this.createPage(pageNumber).canvas = canvas;

    }

    setContext(pageNumber, context) {

        this.createPage(pageNumber).context = context;

    }

    setRenderTask(pageNumber, renderTask) {

        this.createPage(pageNumber).renderTask = renderTask;

    }

    setStatus(pageNumber, status) {

        this.createPage(pageNumber).status = status;

    }

    setVisible(pageNumber, visible) {

        this.createPage(pageNumber).isVisible = visible;

    }

    

    /* ==========================================================
       RESET
    ========================================================== */

    reset() {

        this.pdfDocument = null;

        this.pageCount = 0;

        this.currentPage = 1;

        this.scale = 1;

        this.pages.clear();

    }

}