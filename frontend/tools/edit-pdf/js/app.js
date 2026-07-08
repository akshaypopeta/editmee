import pdfLoader from "./pdfLoader.js";
import renderer from "./renderer.js";

class App {

    constructor() {
this.lastFileName = null;
        this.pdfDocument = null;
        this.currentPage = 1;
        this.totalPages = 0;

        this.elements = {
            fileInput: document.getElementById("pdfInput")
        };

        this.initialize();
    }

    initialize() {

        this.bindEvents();

        console.log("Application initialized.");
    }

  bindEvents() {

    this.elements.fileInput.addEventListener(
        "change",
        this.handleFileSelect.bind(this)
    );

    document.getElementById("uploadButton").addEventListener("click", () => {
        this.elements.fileInput.click();
    });

    document.getElementById("mainUpload").addEventListener("click", () => {
        this.elements.fileInput.click();
    });

    document.getElementById("sidebarUpload").addEventListener("click", () => {
        this.elements.fileInput.click();
    });

    document.getElementById("zoomIn").addEventListener("click", async () => {
    await renderer.zoomIn();
    this.updateZoomUI();
});

document.getElementById("zoomOut").addEventListener("click", async () => {
    await renderer.zoomOut();
    this.updateZoomUI();
});

}

    async handleFileSelect(event) {

document.getElementById("uploadCard").style.display = "none";

console.log("handleFileSelect called");
        try {

            const file = event.target.files[0];

            if (!file) {
                return;
            }
if (this.lastFileName === file.name) {
    console.log("Same file ignored");
    return;
}

this.lastFileName = file.name;
           this.pdfDocument = await pdfLoader.load(file);
console.log("PDF Loaded:", this.pdfDocument);
this.totalPages = pdfLoader.getPageCount();

this.currentPage = 1;

await renderer.setDocument(this.pdfDocument);

console.log("PDF rendered.");

            console.log("PDF Loaded Successfully");

            console.log("Pages:", this.totalPages);

            // Renderer will be called here later

        }

        catch (error) {

            console.error(error);

            alert("Unable to load PDF.");

        }

    }

    getCurrentPage() {

        return this.currentPage;

    }

    getTotalPages() {

        return this.totalPages;

    }

    getDocument() {

        return this.pdfDocument;

    }

    
updateZoomUI() {
    const zoom = renderer.getZoom() * 100;

    document.getElementById("zoomValue").innerText = zoom.toFixed(0) + "%";
    document.getElementById("zoomInfo").innerText = zoom.toFixed(0) + "%";
}

}


const app = new App();

export default app;