const pdfInput = document.getElementById("pdfInput");
const rotateBtn = document.getElementById("rotateBtn");
const rotationSelect = document.getElementById("rotationSelect");
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
   ROTATE PDF (FIXED)
========================= */

rotateBtn.addEventListener("click", async () => {

    if (!selectedFile) {
        alert("Please select a PDF file.");
        return;
    }

    try {
        const rotation = Number(rotationSelect.value);

        const fileBytes = await selectedFile.arrayBuffer();

        const pdfDoc = await PDFLib.PDFDocument.load(fileBytes);

        const pages = pdfDoc.getPages();

        pages.forEach(page => {

            // 🔥 FIX 1: cumulative rotation
            const currentRotation = page.getRotation().angle || 0;
            const newRotation = (currentRotation + rotation) % 360;

            page.setRotation(PDFLib.degrees(newRotation));

        });

        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], {
            type: "application/pdf"
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;

        /* =========================
           FIX 2: CLEAN FILE NAME
        ========================= */

        let originalName = selectedFile.name;

        // remove .pdf extension
        originalName = originalName.replace(/\.pdf$/i, "");

        // remove old rotation suffix if exists
        originalName = originalName.replace(/-rotated-\d+deg$/i, "");

        link.download = `${originalName}-rotated-${rotation}deg.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        fileInfo.textContent = `Rotated ${rotation}° successfully!`;

    } catch (error) {
        console.error(error);
        alert("Failed to rotate PDF.");
    }
});