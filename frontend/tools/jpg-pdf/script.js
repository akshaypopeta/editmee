const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");
const convertBtn = document.getElementById("convertBtn");

let selectedImages = [];

/* =========================
   IMAGE UPLOAD
========================= */

imageInput.addEventListener("change", (e) => {

    const newImages = Array.from(e.target.files);

    selectedImages = [...selectedImages, ...newImages];

    renderImages();

});

/* =========================
   RENDER IMAGES
========================= */

function renderImages() {

    previewContainer.innerHTML = "";

    selectedImages.forEach((file, index) => {

        const imageURL = URL.createObjectURL(file);

        const card = document.createElement("div");

        card.classList.add("preview-card");

        card.innerHTML = `
        
            <img src="${imageURL}" alt="${file.name}">

            <div class="image-info">

                <p>${file.name}</p>

                <div class="action-buttons">

                    <button class="move-up" title="Move Up">
                        <i class="fa-solid fa-arrow-up"></i>
                    </button>

                    <button class="move-down" title="Move Down">
                        <i class="fa-solid fa-arrow-down"></i>
                    </button>

                    <button class="remove-btn" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </div>

        `;

        const removeBtn =
            card.querySelector(".remove-btn");

        const moveUpBtn =
            card.querySelector(".move-up");

        const moveDownBtn =
            card.querySelector(".move-down");

        /* REMOVE */

        removeBtn.addEventListener("click", () => {

            selectedImages.splice(index, 1);

            renderImages();

        });

        /* MOVE UP */

        moveUpBtn.addEventListener("click", () => {

            if (index === 0) return;

            [
                selectedImages[index - 1],
                selectedImages[index]
            ] = [
                selectedImages[index],
                selectedImages[index - 1]
            ];

            renderImages();

        });

        /* MOVE DOWN */

        moveDownBtn.addEventListener("click", () => {

            if (index === selectedImages.length - 1)
                return;

            [
                selectedImages[index + 1],
                selectedImages[index]
            ] = [
                selectedImages[index],
                selectedImages[index + 1]
            ];

            renderImages();

        });

        previewContainer.appendChild(card);

    });

}

/* =========================
   CONVERT TO PDF
========================= */

convertBtn.addEventListener("click", async () => {

    if (selectedImages.length === 0) {

        alert("Please select at least one image.");

        return;

    }

    const { jsPDF } = window.jspdf;

    let pdf = null;

    for (let i = 0; i < selectedImages.length; i++) {

        const file = selectedImages[i];

        const imageData =
            await fileToDataURL(file);

        const img =
            await loadImage(imageData);

        const orientation =
            img.width > img.height
                ? "landscape"
                : "portrait";

        if (i === 0) {

            pdf = new jsPDF({
                orientation,
                unit: "mm",
                format: "a4"
            });

        } else {

            pdf.addPage("a4", orientation);

        }

        const pageWidth =
            pdf.internal.pageSize.getWidth();

        const pageHeight =
            pdf.internal.pageSize.getHeight();

        const ratio = Math.min(
            pageWidth / img.width,
            pageHeight / img.height
        );

        const imgWidth =
            img.width * ratio;

        const imgHeight =
            img.height * ratio;

        const x =
            (pageWidth - imgWidth) / 2;

        const y =
            (pageHeight - imgHeight) / 2;

        const imageFormat =
            file.type === "image/png"
                ? "PNG"
                : "JPEG";

        pdf.addImage(
            imageData,
            imageFormat,
            x,
            y,
            imgWidth,
            imgHeight
        );

    }

    pdf.save("images-to-pdf.pdf");

});

/* =========================
   FILE TO DATA URL
========================= */

function fileToDataURL(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = (e) =>
            resolve(e.target.result);

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}

/* =========================
   LOAD IMAGE
========================= */

function loadImage(src) {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = reject;

        img.src = src;

    });

}