const pdfInput = document.getElementById("pdfInput");
const watermarkBtn = document.getElementById("watermarkBtn");
const watermarkText = document.getElementById("watermarkText");
const opacityRange = document.getElementById("opacityRange");
const opacityValue = document.getElementById("opacityValue");
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
   OPACITY LIVE UPDATE
========================= */

opacityRange.addEventListener("input", () => {
    opacityValue.textContent = opacityRange.value;
});

/* =========================
   WATERMARK PDF
========================= */

watermarkBtn.addEventListener("click", async () => {

    if (!selectedFile) {
        alert("Please select a PDF file.");
        return;
    }

    const text = watermarkText.value.trim();

    if (!text) {
        alert("Enter watermark text");
        return;
    }

    try {

        const fileBytes = await selectedFile.arrayBuffer();

        const pdfDoc = await PDFLib.PDFDocument.load(fileBytes);

        const pages = pdfDoc.getPages();

        const opacity = parseFloat(opacityRange.value);

        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

        pages.forEach(page => {

            const { width, height } = page.getSize();

            // 🔥 DENSE WATERMARK (reduced spacing)
            for (let x = 0; x < width; x += 120) {
                for (let y = 0; y < height; y += 80) {

                    page.drawText(text, {
                        x,
                        y,
                        size: 14, // small & professional
                        font,
                        opacity: opacity,
                        rotate: PDFLib.degrees(30),
                        color: PDFLib.rgb(0.7, 0.7, 0.7)
                    });

                }
            }

        });

        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], {
            type: "application/pdf"
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "watermarked.pdf";
        link.click();

        URL.revokeObjectURL(url);

        fileInfo.textContent = "Watermark added successfully!";

    } catch (error) {
        console.error(error);
        alert("Failed to add watermark.");
    }
});