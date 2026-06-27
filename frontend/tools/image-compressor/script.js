/* ==========================================
   EDITMEE IMAGE COMPRESSOR
========================================== */

const imageInput = document.getElementById("imageInput");
const uploadBox = document.querySelector(".upload-box");
const previewImage = document.getElementById("previewImage");
const compressSection = document.getElementById("compressSection");

const qualitySlider = document.getElementById("qualitySlider");
const qualityValue = document.getElementById("qualityValue");

const compressBtn = document.getElementById("compressBtn");
const downloadBtn = document.getElementById("downloadBtn");

const originalSizeEl = document.getElementById("originalSize");
const compressedSizeEl = document.getElementById("compressedSize");
const savedPercentEl = document.getElementById("savedPercent");

let selectedFile = null;
let currentPreviewUrl = null;
let currentDownloadUrl = null;

/* ==========================================
   ELEMENT CHECK
========================================== */

if (
    !imageInput ||
    !uploadBox ||
    !previewImage ||
    !compressSection ||
    !qualitySlider ||
    !qualityValue ||
    !compressBtn ||
    !downloadBtn
) {
    console.error("Required HTML elements are missing.");
}

/* ==========================================
   FORMAT FILE SIZE
========================================== */

function formatBytes(bytes) {

    if (!bytes) return "0 Bytes";

    const sizes = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];

    const i = Math.floor(
        Math.log(bytes) /
        Math.log(1024)
    );

    return (
        bytes /
        Math.pow(1024, i)
    ).toFixed(2) +
    " " +
    sizes[i];
}



/* ==========================================
   FILE INPUT
========================================== */

imageInput.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (file) {
        loadImage(file);
    }

});

/* ==========================================
   DRAG & DROP
========================================== */

uploadBox.addEventListener("dragover", (e) => {

    e.preventDefault();

    uploadBox.classList.add(
        "drag-active"
    );

});

uploadBox.addEventListener("dragleave", () => {

    uploadBox.classList.remove(
        "drag-active"
    );

});

uploadBox.addEventListener("drop", (e) => {

    e.preventDefault();

    uploadBox.classList.remove(
        "drag-active"
    );

    const file =
        e.dataTransfer.files[0];

    if (file) {

        loadImage(file);

    }

});

/* ==========================================
   LOAD IMAGE
========================================== */

function loadImage(file) {

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert(
            "Only JPG, JPEG, PNG and WEBP images are supported."
        );

        imageInput.value = "";

        return;
    }

    selectedFile = file;

    if (currentPreviewUrl) {

        URL.revokeObjectURL(
            currentPreviewUrl
        );

    }

    currentPreviewUrl =
        URL.createObjectURL(file);

    previewImage.src =
        currentPreviewUrl;

previewImage.decoding = "async";
        
    compressSection.style.display =
        "block";

    if (originalSizeEl) {

        originalSizeEl.textContent =
            formatBytes(file.size);

    }

    if (compressedSizeEl) {

        compressedSizeEl.textContent =
            "-";

    }

    if (savedPercentEl) {

        savedPercentEl.textContent =
            "-";

    }

    downloadBtn.style.display =
        "none";
}

/* ==========================================
   QUALITY SLIDER
========================================== */

qualitySlider.addEventListener(
    "input",
    () => {

        qualityValue.textContent =
            qualitySlider.value;

    }
);

/* ==========================================
   COMPRESS BUTTON
========================================== */

compressBtn.addEventListener(
    "click",
    compressImage
);

/* ==========================================
   COMPRESS IMAGE
========================================== */

function compressImage() {

    if (!selectedFile) {

        alert(
            "Please upload an image."
        );

        return;
    }

    if (compressBtn.disabled) {
        return;
    }

    compressBtn.disabled = true;

    compressBtn.textContent =
        "Compressing...";

    const reader =
        new FileReader();

    reader.onload =
        function (event) {

          const img = new Image();

img.onload = function () {

    const canvas =
        document.createElement("canvas");

    const ctx =
        canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const quality =
        Number(qualitySlider.value) / 100;

    let outputType = "image/jpeg";

    if (qualitySlider.value == "100") {

        compressedSizeEl.textContent =
            formatBytes(selectedFile.size);

        savedPercentEl.textContent =
            "0%";

        downloadBtn.href =
            currentPreviewUrl;

        downloadBtn.download =
            selectedFile.name;

        downloadBtn.style.display =
            "block";

        compressBtn.disabled =
            false;

        compressBtn.textContent =
            "Compress Image";

        return;
    }

    canvas.toBlob(
        (blob) => {

            if (!blob) {

                alert("Compression failed.");

                compressBtn.disabled = false;
                compressBtn.textContent =
                    "Compress Image";

                return;
            }

            if (currentDownloadUrl) {
                URL.revokeObjectURL(
                    currentDownloadUrl
                );
            }

            if (
                blob.size >=
                selectedFile.size
            ) {

                compressedSizeEl.textContent =
                    formatBytes(
                        selectedFile.size
                    );

                savedPercentEl.textContent =
                    "Already Optimized";

                downloadBtn.href =
                    currentPreviewUrl;

                downloadBtn.download =
                    selectedFile.name;

                downloadBtn.style.display =
                    "block";

                compressBtn.disabled =
                    false;

                compressBtn.textContent =
                    "Compress Image";

                return;
            }

            currentDownloadUrl =
                URL.createObjectURL(blob);

            compressedSizeEl.textContent =
                formatBytes(blob.size);

            const saved =
                (
                    (
                        selectedFile.size -
                        blob.size
                    ) /
                    selectedFile.size
                ) * 100;

            savedPercentEl.textContent =
                saved.toFixed(1) + "%";

            downloadBtn.href =
                currentDownloadUrl;

            downloadBtn.download =
                selectedFile.name.replace(
                    /\.[^/.]+$/,
                    ""
                ) +
                "-compressed.jpg";

            downloadBtn.style.display =
                "block";

            compressBtn.disabled =
                false;

            compressBtn.textContent =
                "Compress Image";

        },

        outputType,
        quality
    );

};

img.src =
    URL.createObjectURL(selectedFile);

        };

    reader.readAsDataURL(
        selectedFile
    );
}

/* ==========================================
   CLEANUP
========================================== */

window.addEventListener(
    "beforeunload",
    () => {

        if (
            currentPreviewUrl
        ) {

            URL.revokeObjectURL(
                currentPreviewUrl
            );

        }

        if (
            currentDownloadUrl
        ) {

            URL.revokeObjectURL(
                currentDownloadUrl
            );

        }

    }
);

