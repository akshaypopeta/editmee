const pdfInput = document.getElementById("pdfInput");
const extractBtn = document.getElementById("extractBtn");
const pageInput = document.getElementById("pageInput");
const fileInfo = document.getElementById("fileInfo");

let selectedFile = null;

/* =========================
   FILE SELECT
========================= */

pdfInput.addEventListener("change", (e) => {
    selectedFile = e.target.files[0];

    if (!selectedFile) return;

    fileInfo.textContent = `Selected: ${selectedFile.name}`;
});

/* =========================
   EXTRACT PAGES
========================= */

extractBtn.addEventListener("click", async () => {

    if (!selectedFile) {
        alert("Please select a PDF file.");
        return;
    }

    const input = pageInput.value;

    if (!input) {
        alert("Enter page numbers to extract (e.g. 1,3,5)");
        return;
    }

    try {

        const pagesToExtract = input
            .split(",")
            .map(num => parseInt(num.trim()) - 1);

        const fileBytes = await selectedFile.arrayBuffer();

        const pdfDoc = await PDFLib.PDFDocument.load(fileBytes);

        const newPdf = await PDFLib.PDFDocument.create();

        const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);

        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();

        const blob = new Blob([pdfBytes], { type: "application/pdf" });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "extracted-pages.pdf";
        link.click();

        URL.revokeObjectURL(url);

        fileInfo.textContent = "Pages extracted successfully!";

    } catch (error) {
        console.error(error);
        alert("Failed to extract pages.");
    }
});