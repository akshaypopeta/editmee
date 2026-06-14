/* =========================
   ELEMENTS
========================= */

const pdfInput =
document.getElementById("pdfInput");

const fileInfo =
document.getElementById("fileInfo");

const pdfPreview =
document.getElementById("pdfPreview");

const signatureCanvas =
document.getElementById(
    "signatureCanvas"
);

const clearBtn =
document.getElementById(
    "clearBtn"
);

const ctx =
signatureCanvas.getContext(
    "2d"
);

const signBtn =
document.getElementById(
    "signBtn"
);

const loader =
document.getElementById(
    "loader"
);

const signatureImageInput =
document.getElementById("signatureImageInput");

const signatureStatus =
document.getElementById("signatureStatus");
/* =========================
   GLOBALS
========================= */

let selectedPdfFile = null;
let selectedPdfBytes = null;
const positionInfo =
document.getElementById(
    "positionInfo"
);

let clickedPage = null;

let clickedX = null;

let clickedY = null;

let drawing = false;

let uploadedSignatureImage = null;

 function goHome() {
    window.location.href = "index.html"; // change if your home page name is different
  }
/* =========================
   PDF UPLOAD
========================= */

pdfInput.addEventListener(
    "change",
    async (e) => {

        try {

            selectedPdfFile =
            e.target.files[0];

            if (!selectedPdfFile)
                return;

            fileInfo.textContent =
            `Selected: ${selectedPdfFile.name}`;

           const buffer =
await selectedPdfFile.arrayBuffer();

selectedPdfBytes =
buffer.slice(0);
            await renderPdfPreview();

        }
        catch (error) {

            console.error(
                "Upload Error:",
                error
            );

        }

    }
);

async function renderPdfPreview() {

    try {

        loader.style.display = "block";

        pdfPreview.innerHTML = "";

        // Allow browser to render spinner
        await new Promise(resolve =>
            setTimeout(resolve, 50)
        );

        const loadingTask =
        pdfjsLib.getDocument({
            data: selectedPdfBytes.slice(0)
        });

        const pdf =
        await loadingTask.promise;

        for (
            let pageNum = 1;
            pageNum <= pdf.numPages;
            pageNum++
        ) {

            const page =
            await pdf.getPage(
                pageNum
            );

            const viewport =
            page.getViewport({
                scale: 1.3
            });

            const wrapper =
            document.createElement(
                "div"
            );

            wrapper.className =
            "pdf-page";

            wrapper.style.position =
            "relative";

            const canvas =
            document.createElement(
                "canvas"
            );

            const ctx =
            canvas.getContext(
                "2d"
            );

            canvas.width =
            viewport.width;

            canvas.height =
            viewport.height;

            wrapper.appendChild(
                canvas
            );

            pdfPreview.appendChild(
                wrapper
            );

            await page.render({
                canvasContext:
                ctx,
                viewport
            }).promise;

            /* CLICK POSITION */

            canvas.addEventListener(
                "click",
                (e) => {

                    document
                    .querySelectorAll(
                        ".signature-marker"
                    )
                    .forEach(
                        marker =>
                        marker.remove()
                    );

                    const rect =
                    canvas.getBoundingClientRect();

                    clickedX =
                    e.clientX -
                    rect.left;

                    clickedY =
                    e.clientY -
                    rect.top;

                    clickedPage =
                    pageNum;

                    const marker =
                    document.createElement(
                        "div"
                    );

                    marker.className =
                    "signature-marker";

                    marker.style.position =
                    "absolute";

                    marker.style.width =
                    "16px";

                    marker.style.height =
                    "16px";

                    marker.style.borderRadius =
                    "50%";

                    marker.style.background =
                    "red";

                    marker.style.left =
                    `${clickedX - 8}px`;

                    marker.style.top =
                    `${clickedY - 8}px`;

                    wrapper.appendChild(
                        marker
                    );

                    positionInfo.textContent =
                    `Selected Position: Page ${clickedPage}`;
                }
            );

        }

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "Failed to load PDF preview."
        );

    }

    finally {

        loader.style.display =
        "none";

    }

}
/* =========================
   PDF PREVIEW
========================= */

async function renderPdfPreview() {

    try {

        pdfPreview.innerHTML = "";

       const loadingTask =
pdfjsLib.getDocument({
    data: selectedPdfBytes.slice(0)
});

        const pdf =
        await loadingTask.promise;

        console.log(
            `Pages: ${pdf.numPages}`
        );

        for (
            let pageNum = 1;
            pageNum <= pdf.numPages;
            pageNum++
        ) {

            const page =
            await pdf.getPage(
                pageNum
            );

            const viewport =
            page.getViewport({
                scale: 1.3
            });

            const wrapper =
            document.createElement(
                "div"
            );

            wrapper.className =
            "pdf-page";

            const canvas =
            document.createElement(
                "canvas"
            );

            const context =
            canvas.getContext(
                "2d"
            );

            canvas.width =
            viewport.width;

            canvas.height =
            viewport.height;

            wrapper.appendChild(
                canvas
            );

            pdfPreview.appendChild(
                wrapper
            );

            await page.render({
                canvasContext:
                context,
                viewport:
                viewport
            }).promise;
canvas.addEventListener(
    "click",
    (e) => {

        document
        .querySelectorAll(
            ".signature-marker"
        )
        .forEach(
            marker =>
            marker.remove()
        );

        const rect =
        canvas.getBoundingClientRect();

        clickedX =
        e.clientX -
        rect.left;

        clickedY =
        e.clientY -
        rect.top;

        clickedPage =
        pageNum;

        const marker =
        document.createElement(
            "div"
        );

        marker.className =
        "signature-marker";

        marker.style.left =
        `${clickedX}px`;

        marker.style.top =
        `${clickedY}px`;

        wrapper.appendChild(
            marker
        );

        positionInfo.textContent =
        `Selected: Page ${clickedPage}`;
    }
);
        }

    }
    catch (error) {

        console.error(
            "Preview Error:",
            error
        );

    }

}
/* =========================
   CANVAS STYLE
========================= */

ctx.strokeStyle = "#000";
ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.lineJoin = "round";

/* Prevent mobile scrolling while signing */
signatureCanvas.style.touchAction = "none";

function getPointerPosition(e) {

    const rect =
    signatureCanvas.getBoundingClientRect();

    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

/* =========================
   START DRAW
========================= */

signatureCanvas.addEventListener(
    "pointerdown",
    (e) => {

        drawing = true;

        const pos =
        getPointerPosition(e);

        ctx.beginPath();

        ctx.moveTo(
            pos.x,
            pos.y
        );
    }
);

/* =========================
   DRAW
========================= */

signatureCanvas.addEventListener(
    "pointermove",
    (e) => {

        if (!drawing)
            return;

        const pos =
        getPointerPosition(e);

        ctx.lineTo(
            pos.x,
            pos.y
        );

        ctx.stroke();
    }
);

/* =========================
   STOP DRAW
========================= */

signatureCanvas.addEventListener(
    "pointerup",
    () => {

        drawing = false;
    }
);

signatureCanvas.addEventListener(
    "pointerleave",
    () => {

        drawing = false;
    }
);

signatureCanvas.addEventListener(
    "pointercancel",
    () => {

        drawing = false;
    }
);
/* =========================
   CLEAR SIGNATURE
========================= */

clearBtn.addEventListener(
    "click",
    () => {

        ctx.clearRect(
            0,
            0,
            signatureCanvas.width,
            signatureCanvas.height
        );

    }
);

/* =========================
   SIGN PDF
========================= */
signBtn.addEventListener("click", async () => {

    try {

        if (!selectedPdfBytes) {
            alert("Upload PDF first");
            return;
        }

        if (clickedPage === null) {
            alert("Click on PDF to place signature");
            return;
        }

        /* =========================
           CHECK SIGNATURE EXISTS
        ========================= */

       const hasCanvasSignature =
signatureCanvas.toDataURL("image/png").length > 5000;

const hasUploadedImage =
uploadedSignatureImage !== null;

if (!hasCanvasSignature && !hasUploadedImage) {

    alert("Please draw or upload a signature");
    return;

}

        /* =========================
           LOAD PDF (SAFE COPY)
        ========================= */

        const pdfDoc =
        await PDFLib.PDFDocument.load(
            selectedPdfBytes.slice(0)
        );

        const pages =
        pdfDoc.getPages();

        const page =
        pages[clickedPage - 1];

        /* =========================
           GET SIGNATURE IMAGE
        ========================= */

       let signatureImage;

if (uploadedSignatureImage) {

    const imgBytes =
    await uploadedSignatureImage.arrayBuffer();

    if (uploadedSignatureImage.type === "image/png") {

        signatureImage =
        await pdfDoc.embedPng(imgBytes);

    } else {

        signatureImage =
        await pdfDoc.embedJpg(imgBytes);

    }

} else {

    const pngDataUrl =
    signatureCanvas.toDataURL("image/png");

    signatureImage =
    await pdfDoc.embedPng(pngDataUrl);
}

        /* =========================
           SCALE CALCULATION
        ========================= */

        const previewCanvas =
        pdfPreview.querySelectorAll("canvas")[clickedPage - 1];

        const pdfWidth =
        page.getWidth();

        const pdfHeight =
        page.getHeight();

        const scaleX =
        pdfWidth / previewCanvas.width;

        const scaleY =
        pdfHeight / previewCanvas.height;

        const pdfX =
        clickedX * scaleX;

        const pdfY =
        pdfHeight - (clickedY * scaleY) - 60;

        /* =========================
           DRAW IMAGE
        ========================= */

        page.drawImage(signatureImage, {
            x: pdfX,
            y: pdfY,
            width: 120,
            height: 50
        });

        /* =========================
           SAVE PDF
        ========================= */

        const pdfBytes =
        await pdfDoc.save();

        const blob =
        new Blob([pdfBytes], {
            type: "application/pdf"
        });

        const url =
        URL.createObjectURL(blob);

        const a =
        document.createElement("a");

        a.href = url;
        a.download = "signed.pdf";

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);

        alert("PDF Signed Successfully!");

    }

    catch (error) {

        console.error("SIGN ERROR:", error);

        alert(error.message);

    }

});

signatureImageInput.addEventListener("change", async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    uploadedSignatureImage = file;

    signatureStatus.textContent =
    `Uploaded: ${file.name}`;
});

