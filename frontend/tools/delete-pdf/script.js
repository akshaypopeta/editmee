const pdfInput = document.getElementById("pdfInput");
const deleteBtn = document.getElementById("deleteBtn");
const pageInput = document.getElementById("pageInput");
const fileInfo = document.getElementById("fileInfo");

let selectedFile = null;

/* =========================
   FILE SELECTION
========================= */

pdfInput.addEventListener("change", (e) => {
    selectedFile = e.target.files[0];

    if (!selectedFile) return;

    fileInfo.textContent = `Selected: ${selectedFile.name}`;
});

/* =========================
   DELETE PAGES
========================= */

deleteBtn.addEventListener("click", async () => {

    if (!selectedFile) {
        alert("Please select a PDF file.");
        return;
    }

    const input = pageInput.value;

    if (!input) {
        alert("Enter page numbers to delete (e.g. 1,3,5)");
        return;
    }

    try {

        const pagesToDelete = input
            .split(",")
            .map(num => parseInt(num.trim()) - 1); // convert to 0-based index

        const fileBytes = await selectedFile.arrayBuffer();

        const pdfDoc = await PDFLib.PDFDocument.load(fileBytes);

        const totalPages = pdfDoc.getPageCount();

        const newPdf = await PDFLib.PDFDocument.create();

        const keepPages = Array.from({ length: totalPages }, (_, i) => i)
            .filter(i => !pagesToDelete.includes(i));

        const copiedPages = await newPdf.copyPages(pdfDoc, keepPages);

        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();

        const blob = new Blob([pdfBytes], { type: "application/pdf" });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "deleted-pages.pdf";
        link.click();

        URL.revokeObjectURL(url);

        fileInfo.textContent = "Pages deleted successfully!";

    } catch (error) {
        console.error(error);
        alert("Failed to delete pages.");
    }
});