/* ==========================================================
   EDITMEE
   FILE : rendering/pdfRenderer.js
   PURPOSE :
   Responsible only for rendering PDF pages onto canvases.
==========================================================*/

export default class PDFRenderer {

 constructor(pageManager) {

    this.pageManager = pageManager;

    this.lastClickTime = 0;

    this.DOUBLE_CLICK_DELAY = 300;

    this.renderer = null;

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

    // Save viewport for search highlights
    pageState.viewport = viewport;

    const cssWidth = viewport.width / window.devicePixelRatio;
    const cssHeight = viewport.height / window.devicePixelRatio;

    const canvas = pageState.canvas;
    const context = pageState.context;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    pageState.selectionCanvas.width = viewport.width;
pageState.selectionCanvas.height = viewport.height;

pageState.selectionCanvas.style.width = cssWidth + "px";
pageState.selectionCanvas.style.height = cssHeight + "px";

    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";

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

const renderer = this.pageManager.renderer;

pageState.selectionCanvas.onclick = (event) => {

    const rect = pageState.selectionCanvas.getBoundingClientRect();

    const scale = window.devicePixelRatio;

    const x = (event.clientX - rect.left) * scale;

    const y = (event.clientY - rect.top) * scale;

    const object = renderer.selectionManager.findObjectAtPoint(
        pageNumber,
        x,
        y,
        viewport
    );

    if (!object) return;

    renderer.selectionManager.select(object);

    renderer.drawSelection(pageNumber);

};

pageState.selectionCanvas.ondblclick = (event) => {

    const rect = pageState.selectionCanvas.getBoundingClientRect();

    const scale = window.devicePixelRatio;

    const x = (event.clientX - rect.left) * scale;

    const y = (event.clientY - rect.top) * scale;

    const object = renderer.selectionManager.findObjectAtPoint(
        pageNumber,
        x,
        y,
        viewport
    );

    if (!object) return;

    renderer.selectionManager.select(object);

    renderer.selectionManager.enterEditMode(
        pageNumber,
        viewport
    );

};

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