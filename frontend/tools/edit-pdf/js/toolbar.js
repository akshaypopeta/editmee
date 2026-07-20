document.getElementById("saveBtn").addEventListener("click", async () => {
  // Load original PDF bytes (from the file you opened)
  const originalPdfBytes = await fetch(renderer.pdfDocumentUrl).then(res => res.arrayBuffer());

  // Rewrite with edits
  const newPdfBytes = await saveEditedPDF(originalPdfBytes, renderer.objectManager);

  // Trigger download
  const blob = new Blob([newPdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "edited.pdf";
  link.click();
});
