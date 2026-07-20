let originalPdfBytes = null;
let pdfDoc = null;

const input = document.getElementById("pdfInput");
const saveBtn = document.getElementById("saveBtn");

input.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  originalPdfBytes = await file.arrayBuffer();

  // Render with pdf.js
  const loadingTask = pdfjsLib.getDocument({ data: originalPdfBytes });
  pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(1);

  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  document.getElementById("pdfContainer").innerHTML = "";
  document.getElementById("pdfContainer").appendChild(canvas);

  await page.render({ canvasContext: ctx, viewport }).promise;

  // For demo: replace text on click
  canvas.addEventListener("click", async () => {
    await editPdfText("Digital Marketing Specialist", "Senior Marketing Manager");
  });
});

async function editPdfText(oldText, newText) {
  // Load with pdf-lib
  const pdfDocLib = await PDFLib.PDFDocument.load(originalPdfBytes);
  const pages = pdfDocLib.getPages();
  const firstPage = pages[0];

  // Simple replacement: cover old text and write new one
  // (In real use, you'd locate exact coordinates via text extraction)
  firstPage.drawRectangle({
    x: 50,
    y: 700,
    width: 300,
    height: 20,
    color: PDFLib.rgb(1, 1, 1), // white background to hide old text
  });

  const font = await pdfDocLib.embedFont(PDFLib.StandardFonts.Helvetica);
  firstPage.drawText(newText, {
    x: 50,
    y: 700,
    size: 12,
    font,
    color: PDFLib.rgb(0, 0, 0),
  });

  const newPdfBytes = await pdfDocLib.save();
  downloadPdf(newPdfBytes);
}

function downloadPdf(bytes) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "updated.pdf";
  link.click();
}

saveBtn.addEventListener("click", async () => {
  // Example: replace another text when Save is clicked
  await editPdfText("Career Objective", "Professional Summary");
});
