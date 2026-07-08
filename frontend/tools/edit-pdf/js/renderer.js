/**
 * ============================================================================
 * EditMee PDF Editor
 * Renderer
 * ============================================================================
 */
import PageManager from "./rendering/pageManager.js";
import PDFRenderer from "./rendering/pdfRenderer.js";
import RenderQueue from "./rendering/renderQueue.js";
import TextManager from "./textManager.js";
import SearchIndex from "./searchIndex.js";
import SearchController from "./search/searchController.js";
import HighlightManager from "./search/highlightManager.js";

class Renderer {

    constructor() {

        this.canvas = null;
        this.context = null;

        this.pdfDocument = null;

        this.currentPage = 1;

        this.zoom = 1;

this.pageManager = new PageManager();

this.textManager = null;

this.highlightManager = new HighlightManager(this);

this.pdfRenderer = new PDFRenderer(this.pageManager);

this.renderQueue = new RenderQueue(this.pdfRenderer);

        this.isRendering = false;

          // ✅ ADD THESE
        this.MIN_ZOOM = 0.5;
        this.MAX_ZOOM = 3.0;


        this.initialize();

    }

  initialize() {

    // Main viewer
    this.container = document.getElementById("pdfContainer");

// Actual scrolling element
this.scrollContainer = document.querySelector(".viewer-scroll");

    // Sidebar
    this.thumbnailList = document.getElementById("thumbnailList");

    // Clear viewer
    this.container.innerHTML = "";

    // Wrapper for all PDF pages
    this.pagesWrapper = document.createElement("div");

    this.pagesWrapper.id = "pagesWrapper";

    this.container.appendChild(this.pagesWrapper);

    // Detect current page while scrolling
this.scrollContainer.addEventListener(
    "scroll",
    this.handleScroll.bind(this)
);


}
 
async setDocument(pdfDocument) {

    this.highlightManager.clear();

    this.pdfDocument = pdfDocument;

    this.pageManager.setDocument(pdfDocument);

    this.textManager = new TextManager(pdfDocument);

    this.searchIndex = new SearchIndex(this.textManager);

   this.searchController = new SearchController(this);

    this.pageManager.setScale(this.zoom);

    this.createPageViews();

    // Start thumbnails (don't wait)
    const thumbnailsPromise = this.renderThumbnails();

    // Render viewer immediately
    await this.renderAllPages();

    // Let thumbnails finish in background
    await thumbnailsPromise;

    
}

async renderThumbnails() {

    if (!this.pdfDocument) return;

    this.thumbnailList.innerHTML = "";

    for (let pageNumber = 1; pageNumber <= this.pdfDocument.numPages; pageNumber++) {

        const page = await this.pdfDocument.getPage(pageNumber);

       const thumbnailScale = 0.25;

const viewport = page.getViewport({
    scale: thumbnailScale * window.devicePixelRatio
});

        const thumbnailCanvas = document.createElement("canvas");

        const thumbnailContext = thumbnailCanvas.getContext("2d");

        thumbnailCanvas.width = viewport.width;
        thumbnailCanvas.height = viewport.height;

thumbnailCanvas.style.width =
    viewport.width / window.devicePixelRatio + "px";

thumbnailCanvas.style.height =
    viewport.height / window.devicePixelRatio + "px";

        thumbnailCanvas.className = "thumbnail";

    thumbnailCanvas.addEventListener("click", () => {

    const pageCanvas = this.pagesWrapper.querySelector(
        `[data-page="${pageNumber}"]`
    );

    if (pageCanvas) {

        pageCanvas.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    this.updateActiveThumbnail(pageNumber);

});

        this.thumbnailList.appendChild(thumbnailCanvas);

        await page.render({
            canvasContext: thumbnailContext,
            viewport: viewport
        }).promise;

    }

    this.updateActiveThumbnail(this.currentPage);

}

createPageViews() {

    this.pagesWrapper.innerHTML = "";

    this.pageManager.clearPages();

    for (let pageNumber = 1; pageNumber <= this.pdfDocument.numPages; pageNumber++) {

        const pageWrapper = document.createElement("div");

pageWrapper.className = "pdf-page";

pageWrapper.dataset.page = pageNumber;

// PDF Canvas
const canvas = document.createElement("canvas");

const context = canvas.getContext("2d");

// Highlight Layer
const highlightLayer = document.createElement("div");

highlightLayer.className = "highlight-layer";

// Append in correct order
pageWrapper.appendChild(canvas);
pageWrapper.appendChild(highlightLayer);

this.pagesWrapper.appendChild(pageWrapper);

        const pageState = this.pageManager.createPage(pageNumber);

        pageState.container = pageWrapper;
pageState.canvas = canvas;
pageState.context = context;
pageState.highlightLayer = highlightLayer;

        

    }

}

async renderAllPages() {

    if (!this.pdfDocument) return;

    const pageToRestore = this.currentPage;



    for (let pageNumber = 1; pageNumber <= this.pdfDocument.numPages; pageNumber++) {

      const pageState = this.pageManager.getPage(pageNumber);

if (!pageState) continue;

// Render using PDFRenderer
await this.pdfRenderer.renderPage(pageNumber);

 

      }

 

    // Keep thumbnail active
    this.currentPage = pageToRestore;

await new Promise(resolve => requestAnimationFrame(resolve));

this.scrollToCurrentPage();

this.updateActiveThumbnail(this.currentPage);

// Temporary test
this.highlightManager.drawTestHighlight(1);

}

updateActiveThumbnail(pageNumber) {

    const thumbnails = this.thumbnailList.querySelectorAll(".thumbnail");

    thumbnails.forEach((thumbnail, index) => {

        const isActive = (index + 1 === pageNumber);

        thumbnail.classList.toggle("active", isActive);

        if (isActive) {

            thumbnail.scrollIntoView({

                block: "nearest",
                behavior: "smooth"

            });

        }

    });

}

handleScroll() {

    const pages = this.pagesWrapper.querySelectorAll(".pdf-page");

    if (!pages.length) return;

    const containerTop =
    this.scrollContainer.getBoundingClientRect().top;

    let closestPage = 1;

    let smallestDistance = Number.MAX_VALUE;

    pages.forEach((page, index) => {

        const rect = page.getBoundingClientRect();

        const distance = Math.abs(rect.top - containerTop);

        if (distance < smallestDistance) {

            smallestDistance = distance;

            closestPage = index + 1;

        }

    });

    if (closestPage !== this.currentPage) {

        this.currentPage = closestPage;

        document.getElementById("pageInfo").textContent =
    `Page ${closestPage} / ${this.pdfDocument.numPages}`;

        

        this.updateActiveThumbnail(closestPage);

    }

}

scrollToCurrentPage() {

    const page = this.pagesWrapper.querySelector(
        `[data-page="${this.currentPage}"]`
    );

    if (!page) return;

    page.scrollIntoView({

        behavior: "auto",

        block: "start"

    });

}

    async renderPage(pageNumber = 1) {

    if (!this.pdfDocument) return;

    this.currentPage = pageNumber;

    this.updateActiveThumbnail(pageNumber);

    const pageCanvas = this.pagesWrapper.querySelector(
        `[data-page="${pageNumber}"]`
    );

    if (pageCanvas) {

        pageCanvas.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}

async renderSinglePage(pageNumber, pageWrapper) {

    const page = await this.pdfDocument.getPage(pageNumber);

    const viewport = page.getViewport({
        scale: this.zoom * window.devicePixelRatio
    });

    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d");

    canvas.width = viewport.width;

    canvas.height = viewport.height;

    canvas.style.width =
        viewport.width / window.devicePixelRatio + "px";

    canvas.style.height =
        viewport.height / window.devicePixelRatio + "px";

    pageWrapper.innerHTML = "";

    pageWrapper.appendChild(canvas);

    await page.render({

        canvasContext: context,

        viewport: viewport

    }).promise;

}

    async nextPage() {

        if (!this.pdfDocument) return;

        if (this.currentPage >= this.pdfDocument.numPages) return;

        await this.renderPage(this.currentPage + 1);

    }

    async previousPage() {

        if (!this.pdfDocument) return;

        if (this.currentPage <= 1) return;

        await this.renderPage(this.currentPage - 1);

    }

  async zoomIn() {

    if (this.zoom >= this.MAX_ZOOM) return;

    this.zoom += 0.25;

this.pageManager.setScale(this.zoom);

    await this.renderAllPages();

}

 async zoomOut() {

    if (this.zoom <= this.MIN_ZOOM) return;

    this.zoom -= 0.25;

    this.pageManager.setScale(this.zoom);

    await this.renderAllPages();

}

    getZoom() {

        return this.zoom;

    }

    getCurrentPage() {

        return this.currentPage;

    }
/**
 * Search the current PDF.
 */
async search(query) {

    return await this.searchIndex.searchDocument(query);

}

}

const renderer = new Renderer();

// Temporary for development/testing
window.renderer = renderer;

export default renderer;