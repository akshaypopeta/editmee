/* ==========================================================
   EDITMEE
   FILE : rendering/pdfRenderer.js
   PURPOSE :
   Responsible only for rendering PDF pages onto canvases.
==========================================================*/

export default class PDFRenderer {

    constructor(pageManager) {

        this.pageManager = pageManager;

    }

    async renderPage(pageNumber) {

        const pageState = this.pageManager.getPage(pageNumber);

        if (!pageState) {
            throw new Error(`Page ${pageNumber} is not registered.`);
        }

        pageState.status = "loading";

        // Load PDF page if needed
        if (!pageState.pdfPage) {

            const pdfPage = await this.pageManager
                .getDocument()
                .getPage(pageNumber);

            pageState.pdfPage = pdfPage;

        }

        const viewport = pageState.pdfPage.getViewport({
            scale: this.pageManager.getScale() * window.devicePixelRatio
        });

        pageState.viewport = viewport;

const cssWidth = viewport.width / window.devicePixelRatio;
const cssHeight = viewport.height / window.devicePixelRatio;

        const canvas = pageState.canvas;
        const context = pageState.context;

        canvas.width = viewport.width;
canvas.height = viewport.height;

canvas.style.width = cssWidth + "px";
canvas.style.height = cssHeight + "px";

/* Resize the page container too */
pageState.container.style.width = cssWidth + "px";
pageState.container.style.height = cssHeight + "px";

        pageState.status = "rendering";

        const renderTask = pageState.pdfPage.render({

            canvasContext: context,
            viewport

        });

        pageState.renderTask = renderTask;

        await renderTask.promise;

        pageState.status = "rendered";

    }

    cancel(pageNumber) {

        const pageState = this.pageManager.getPage(pageNumber);

        if (!pageState) return;

        if (pageState.renderTask) {

            pageState.renderTask.cancel();

            pageState.renderTask = null;

        }

        pageState.status = "cancelled";

    }

}