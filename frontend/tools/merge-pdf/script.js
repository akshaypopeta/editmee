const pdfInput = document.getElementById("pdfInput");
const uploadBox = document.getElementById("uploadBox");
const fileList = document.getElementById("fileList");
const mergeBtn = document.getElementById("mergeBtn");
const loader = document.getElementById("loader");

let selectedFiles = [];

/* =========================
   FILE SELECTION
========================= */

pdfInput.addEventListener("change", (e) => {

  const files = Array.from(e.target.files);

  addFiles(files);

});

/* =========================
   DRAG & DROP
========================= */

uploadBox.addEventListener("dragover", (e) => {

  e.preventDefault();

  uploadBox.classList.add("dragover");

});

uploadBox.addEventListener("dragleave", () => {

  uploadBox.classList.remove("dragover");

});

uploadBox.addEventListener("drop", (e) => {

  e.preventDefault();

  uploadBox.classList.remove("dragover");

  const files = Array.from(e.dataTransfer.files);

  addFiles(files);

});

/* =========================
   ADD FILES
========================= */

function addFiles(files) {

  files.forEach((file) => {

    if (file.type !== "application/pdf") {
      alert(`${file.name} is not a PDF file.`);
      return;
    }

    selectedFiles.push(file);

  });

  renderFiles();

}

/* =========================
   RENDER FILES
========================= */

function renderFiles() {

  fileList.innerHTML = "";

  selectedFiles.forEach((file, index) => {

    const fileItem = document.createElement("div");

    fileItem.classList.add("file-item");

    const fileSize = (file.size / 1024 / 1024).toFixed(2);

    fileItem.innerHTML = `

      <div class="file-left">

        <div class="file-icon">
          <i class="fa-solid fa-file-pdf"></i>
        </div>

        <div class="file-info">

          <h3>${file.name}</h3>

          <p>${fileSize} MB</p>

        </div>

      </div>

      <button class="remove-btn">
        <i class="fa-solid fa-trash"></i>
      </button>

    `;

    /* REMOVE FILE */

    const removeBtn = fileItem.querySelector(".remove-btn");

    removeBtn.addEventListener("click", () => {

      selectedFiles.splice(index, 1);

      renderFiles();

    });

    fileList.appendChild(fileItem);

  });

}

/* =========================
   MERGE PDF
========================= */

mergeBtn.addEventListener("click", async () => {

  if (selectedFiles.length < 2) {
    alert("Please select at least 2 PDF files.");
    return;
  }

  try {

    loader.classList.remove("hidden");

    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of selectedFiles) {

      const arrayBuffer = await file.arrayBuffer();

      const pdf = await PDFLib.PDFDocument.load(arrayBuffer);

      const copiedPages = await mergedPdf.copyPages(
        pdf,
        pdf.getPageIndices()
      );

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });

    }

    /* SAVE MERGED PDF */

    const mergedPdfFile = await mergedPdf.save();

    /* DOWNLOAD */

    downloadPDF(mergedPdfFile);

    loader.classList.add("hidden");

  } catch (error) {

    console.error(error);

    loader.classList.add("hidden");

    alert("Something went wrong while merging PDFs.");

  }

});

/* =========================
   DOWNLOAD PDF
========================= */

function downloadPDF(pdfBytes) {

  const blob = new Blob(
    [pdfBytes],
    { type: "application/pdf" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = "merged-pdf-toolkit.pdf";

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);

}