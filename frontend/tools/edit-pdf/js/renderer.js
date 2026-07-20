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
import ObjectManager from "./objects/objectManager.js";
import TextExtractor from "./objects/textExtractor.js";
import SelectionManager from "./editing/selectionManager.js";
import BlockBuilder from "./objects/blockBuilder.js";
import WordBuilder from "./objects/wordBuilder.js";
import { getObjectBounds } from "./utils/objectBounds.js";
import EditingLayer from "./editing/editingLayer.js";


class Renderer {

    constructor() {

        this.canvas = null;
        this.context = null;

        this.pdfDocument = null;

        this.currentPage = 1;

        this.zoom = 1;

this.pageManager = new PageManager();

this.textManager = null;

this.objectManager = new ObjectManager();

this.editingLayer = new EditingLayer(this.pageManager);

window.objectManager = this.objectManager;

this.blockBuilder = new BlockBuilder();

this.wordBuilder = new WordBuilder();

this.textExtractor = null;

this.selectionManager = new SelectionManager(
    this.objectManager,
    this.pageManager
);



this.highlightManager = new HighlightManager(this);

this.pdfRenderer = new PDFRenderer(this.pageManager);

this.renderQueue = new RenderQueue(this.pdfRenderer);

        this.isRendering = false;

        this.lastClickTime = 0;
this.DOUBLE_CLICK_DELAY = 300;

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

    this.textExtractor = new TextExtractor(
    this.pageManager,
    this.objectManager
);

    this.searchIndex = new SearchIndex(this.textManager);

   this.searchController = new SearchController(this);

    this.pageManager.setScale(this.zoom);

    this.createPageViews();

    // Start thumbnails (don't wait)
    const thumbnailsPromise = this.renderThumbnails();

    // Render viewer immediately
    await this.renderAllPages();

   await this.textExtractor.extractDocument();

for (const [pageNumber, objects] of this.objectManager.getAllPages()) {

    // Build Blocks
    const blocks = this.blockBuilder.build(objects);

    this.objectManager.setBlockObjects(
        pageNumber,
        blocks
    );

    // Build Words
    const words = this.wordBuilder.build(objects);

    this.objectManager.setWordObjects(
        pageNumber,
        words
    );

}

// Temporary verification
console.log(
    this.objectManager.getBlockObjects(1)
);
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

pageWrapper.style.position = "relative";

pageWrapper.dataset.page = pageNumber;

// PDF Canvas
const canvas = document.createElement("canvas");

const context = canvas.getContext("2d");

const selectionCanvas = document.createElement("canvas");
const selectionContext = selectionCanvas.getContext("2d");

selectionCanvas.className = "selection-canvas";

// Highlight Layer
const highlightLayer = document.createElement("div");

highlightLayer.className = "highlight-layer";

// Append in correct order
pageWrapper.appendChild(canvas);
pageWrapper.appendChild(selectionCanvas);
pageWrapper.appendChild(highlightLayer);

this.pagesWrapper.appendChild(pageWrapper);

        const pageState = this.pageManager.createPage(pageNumber);

        pageState.container = pageWrapper;
 
        pageState.canvas = canvas;
pageState.context = context;

pageState.selectionCanvas = selectionCanvas;
pageState.selectionContext = selectionContext;

pageState.highlightLayer = highlightLayer;

this.editingLayer.initializePage(pageNumber);

pageWrapper.addEventListener(
    "click",
    (event) => this.handlePageClick(event, pageNumber)
);     

pageWrapper.addEventListener("dblclick", (event) => {

    console.log("Double Click Event Fired");

    this.handlePageDoubleClick(event, pageNumber);

});

    }

}

async renderAllPages() {

    if (!this.pdfDocument) return;

    const pageToRestore = this.currentPage;



    for (let pageNumber = 1; pageNumber <= this.pdfDocument.numPages; pageNumber++) {

      const pageState = this.pageManager.getPage(pageNumber);

if (!pageState) continue;

// Render using PDFRenderer
await this.redrawPage(pageNumber);
 

      }

 

    // Keep thumbnail active
    this.currentPage = pageToRestore;

await new Promise(resolve => requestAnimationFrame(resolve));

this.scrollToCurrentPage();

this.updateActiveThumbnail(this.currentPage);



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

async handlePageClick(event, pageNumber) {
    const pageState = this.pageManager.getPage(pageNumber);
    if (!pageState || !pageState.viewport) return;

    const rect = pageState.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const object = this.selectionManager.findObjectAtPoint(
        pageNumber,
        x,
        y,
        pageState.viewport
    );

    if (!object) {
        this.selectionManager.clear();
        this.drawSelection(pageNumber);
        return;
    }

    if (this.selectionManager.getSelectedObject() !== object) {
        this.selectionManager.select(object);
    }

    this.drawSelection(pageNumber);
}


handlePageDoubleClick(event, pageNumber) {

    const pageState = this.pageManager.getPage(pageNumber);

    if (!pageState || !pageState.viewport) {
        return;
    }

    const rect = pageState.canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;

    const y = event.clientY - rect.top;

    const object = this.selectionManager.findObjectAtPoint(
        pageNumber,
        x,
        y,
        pageState.viewport
    );

    if (!object) {
        return;
    }

    this.selectionManager.select(object);

// ✅ Use new EditingLayer integration
this.selectionManager.enterEditMode(pageNumber, pageState.viewport);

this.drawSelection(pageNumber);

console.log("Entered Edit Mode:", object.text);


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

isEditingActive() {
  for (const [pageNumber, objects] of this.objectManager.getAllPages()) {
    for (const object of objects) {
      if (object.editing) return true;
    }
  }
  return false;
}

async zoomIn() {
  if (this.zoom >= this.MAX_ZOOM) return;
  if (this.isEditingActive()) {
    console.warn("Zoom disabled during editing");
    return;
  }
  this.zoom += 0.25;
  this.pageManager.setScale(this.zoom);
  await this.renderAllPages();
}

async zoomOut() {
  if (this.zoom <= this.MIN_ZOOM) return;
  if (this.isEditingActive()) {
    console.warn("Zoom disabled during editing");
    return;
  }
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

drawSelection(pageNumber) {

    const pageState = this.pageManager.getPage(pageNumber);

    if (!pageState) return;

    const ctx = pageState.selectionContext;

    if (!ctx) return;

    // Clear previous selection
    ctx.clearRect(
        0,
        0,
        pageState.selectionCanvas.width,
        pageState.selectionCanvas.height
    );

    const object = this.selectionManager.getSelectedObject();

    if (!object) return;

 



    if (object.page !== pageNumber) return;

    const bounds = getObjectBounds(
        object,
        pageState.viewport
    );

    ctx.save();

    ctx.strokeStyle = "#2F80ED";
    ctx.lineWidth = 2;

    ctx.strokeRect(
    bounds.left,
    bounds.top,
    bounds.width,
    bounds.height
);


// Draw caret when editing
if (object.editing) {

    const caretX = bounds.left;

    ctx.beginPath();

    ctx.moveTo(
        caretX,
        bounds.top + 3
    );

    ctx.lineTo(
        caretX,
        bounds.bottom - 3
    );

    ctx.stroke();

}


ctx.restore();

}

async redrawPage(pageNumber) {
  // Render the original PDF page
  await this.pdfRenderer.renderPage(pageNumber);

  // Sync editing layer so DOM blocks stay aligned with the new viewport
  const pageState = this.pageManager.getPage(pageNumber);
  if (pageState && pageState.viewport) {
    this.editingLayer.syncWithViewport(pageNumber, pageState.viewport);
  }

  // Draw selection highlights (blue box, caret, etc.)
  this.drawSelection(pageNumber);

  // Draw edited text on the overlay (selection canvas)
  this.drawEditedObjects(pageNumber);
}



/**
 * Search the current PDF.
 */
async search(query) {

    return await this.searchIndex.searchDocument(query);

}

drawEditedObjects(pageNumber) {
  const pageState = this.pageManager.getPage(pageNumber);
  if (!pageState) return;

  const ctx = pageState.selectionContext;
  const viewport = pageState.viewport;
  if (!ctx || !viewport) return;

  ctx.clearRect(0, 0, pageState.selectionCanvas.width, pageState.selectionCanvas.height);

  const objects = this.objectManager.getBlockObjects(pageNumber);

  for (const object of objects) {
    if (!object.edited) continue;
    if (object.editing) continue;
    if (object.visible === false) {
      // Only draw the new text, not the old one
      const x = object.x * viewport.scale;
      const y = viewport.height - (object.y * viewport.scale);

      ctx.font = `${object.height * viewport.scale}px sans-serif`;
      ctx.fillStyle = "black";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(object.text, x, y);
    }
  }
}





}


async function saveEditedPDF(originalPdfBytes, objectManager) {
  const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
  const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

  for (const [pageNumber, objects] of objectManager.getAllPages()) {
    const page = pdfDoc.getPage(pageNumber - 1);

    for (const object of objects) {
     if (object.edited) {
  page.drawRectangle({
    x: object.x,
    y: object.y - object.height,
    width: object.width,
    height: object.height,
    color: PDFLib.rgb(1, 1, 1), // white background
  });
  page.drawText(object.text, {
    x: object.x,
    y: object.y,
    size: object.height,
    font,
    color: PDFLib.rgb(0, 0, 0),
  });
}


    }
  }

  const newPdfBytes = await pdfDoc.save();
  return newPdfBytes;
}


const renderer = new Renderer();

// Temporary for development/testing
window.renderer = renderer;

function collectEditedBlocks(objectManager) {
  const editedBlocks = [];
  for (const [pageNumber, objects] of objectManager.getAllPages()) {
    for (const object of objects) {
      if (object.edited) {
        editedBlocks.push({ pageNumber, object });
      }
    }
  }
  return editedBlocks;
}


export default renderer;