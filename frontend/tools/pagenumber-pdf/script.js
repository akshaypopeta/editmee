const pdfInput = document.getElementById("pdfInput");
const numberBtn = document.getElementById("numberBtn");
const startNumber = document.getElementById("startNumber");
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
   ADD PAGE NUMBERS
========================= */

numberBtn.addEventListener("click", async () => {

    if (!selectedFile) {
        alert("Please select a PDF file.");
        return;
    }

    try {

        const startNum = parseInt(startNumber.value) || 1;

        const fileBytes = await selectedFile.arrayBuffer();

        const pdfDoc = await PDFLib.PDFDocument.load(fileBytes);

        const pages = pdfDoc.getPages();

        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

        pages.forEach((page, index) => {

            const { width } = page.getSize();

            const pageNumber = startNum + index;

            const text = `${pageNumber}`;

            const textWidth = font.widthOfTextAtSize(text, 12);

            page.drawText(text, {
                x: (width - textWidth) / 2,
                y: 20, // bottom position
                size: 12,
                font,
                color: PDFLib.rgb(0, 0, 0),
                opacity: 0.7
            });

        });

        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], {
            type: "application/pdf"
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "numbered.pdf";
        link.click();

        URL.revokeObjectURL(url);

        fileInfo.textContent = "Page numbers added successfully!";

    } catch (error) {
        console.error(error);
        alert("Failed to add page numbers.");
    }
});