const pdfInput = document.getElementById("pdfInput");
const previewContainer = document.getElementById("previewContainer");

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/* =========================
   PDF UPLOAD
========================= */

pdfInput.addEventListener("change", async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    previewContainer.innerHTML = "";

    try {

        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
            data: arrayBuffer
        }).promise;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

            const page = await pdf.getPage(pageNumber);

            const viewport = page.getViewport({
                scale: 1.5
            });

            const canvas = document.createElement("canvas");

            const context = canvas.getContext("2d");

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            createPreviewCard(canvas, pageNumber);

        }

    } catch (error) {

        console.error(error);

        alert("Failed to load PDF.");

    }

});

/* =========================
   PREVIEW CARD
========================= */

function createPreviewCard(canvas, pageNumber) {

    const card = document.createElement("div");

    card.classList.add("page-card");

    const previewCanvas =
        document.createElement("canvas");

    previewCanvas.width = canvas.width;
    previewCanvas.height = canvas.height;

    const previewContext =
        previewCanvas.getContext("2d");

    previewContext.drawImage(
        canvas,
        0,
        0
    );

    const info =
        document.createElement("div");

    info.classList.add("page-info");

    info.innerHTML = `
        <span>Page ${pageNumber}</span>
        <button class="download-btn">
            Download JPG
        </button>
    `;

    const button =
        info.querySelector(".download-btn");

    button.addEventListener("click", () => {

        const link =
            document.createElement("a");

        link.href =
            canvas.toDataURL(
                "image/jpeg",
                1.0
            );

        link.download =
            `page-${pageNumber}.jpg`;

        link.click();

    });

    card.appendChild(previewCanvas);
    card.appendChild(info);

    previewContainer.appendChild(card);

}