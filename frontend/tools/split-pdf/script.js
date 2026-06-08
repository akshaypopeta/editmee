const pdfInput = document.getElementById("pdfInput");
const pageCount = document.getElementById("pageCount");
const pdfInfo = document.getElementById("pdfInfo");
const splitBtn = document.getElementById("splitBtn");
const pageRange = document.getElementById("pageRange");

let uploadedPdfFile = null;
let totalPages = 0;

/* ==========================
   PDF UPLOAD
========================== */

pdfInput.addEventListener("change", async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
        alert("Please select a valid PDF file.");
        return;
    }

    try {

        uploadedPdfFile = file;

        const arrayBuffer = await file.arrayBuffer();

        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

        totalPages = pdfDoc.getPageCount();

        pageCount.textContent = totalPages;

        pdfInfo.classList.remove("hidden");

    } catch (error) {

        console.error(error);

        alert("Unable to read PDF file.");

    }

});

/* ==========================
   SPLIT PDF
========================== */

splitBtn.addEventListener("click", async () => {

    if (!uploadedPdfFile) {
        alert("Please upload a PDF first.");
        return;
    }

    const range = pageRange.value.trim();

    if (!range) {
        alert("Please enter page range.");
        return;
    }

    try {

        const pages = getPagesFromRange(range);

        if (pages.length === 0) {
            alert("Invalid page range.");
            return;
        }

        const originalPdfBytes =
            await uploadedPdfFile.arrayBuffer();

        const originalPdf =
            await PDFLib.PDFDocument.load(originalPdfBytes);

        const newPdf =
            await PDFLib.PDFDocument.create();

        const copiedPages =
            await newPdf.copyPages(
                originalPdf,
                pages
            );

        copiedPages.forEach(page => {
            newPdf.addPage(page);
        });

        const pdfBytes = await newPdf.save();

        downloadPdf(pdfBytes);

    } catch (error) {

        console.error(error);

        alert("Failed to split PDF.");

    }

});

/* ==========================
   PAGE RANGE PARSER
========================== */

function getPagesFromRange(range) {

    const result = [];

    const parts = range.split(",");

    parts.forEach(part => {

        part = part.trim();

        if (part.includes("-")) {

            const [start, end] =
                part.split("-").map(Number);

            if (
                isNaN(start) ||
                isNaN(end) ||
                start < 1 ||
                end > totalPages ||
                start > end
            ) {
                return;
            }

            for (let i = start; i <= end; i++) {
                result.push(i - 1);
            }

        } else {

            const page = Number(part);

            if (
                !isNaN(page) &&
                page >= 1 &&
                page <= totalPages
            ) {
                result.push(page - 1);
            }

        }

    });

    return [...new Set(result)];

}

/* ==========================
   DOWNLOAD PDF
========================== */

function downloadPdf(pdfBytes) {

    const blob = new Blob(
        [pdfBytes],
        { type: "application/pdf" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "split-pdf.pdf";

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);

}