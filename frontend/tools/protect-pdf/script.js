const pdfInput =
document.getElementById("pdfInput");

const fileInfo =
document.getElementById("fileInfo");

const protectBtn =
document.getElementById("protectBtn");

const password =
document.getElementById("password");

const confirmPassword =
document.getElementById("confirmPassword");

const loader =
document.getElementById("loader");

let selectedFile = null;

/* =====================
   PDF SELECT
===================== */
const MAX_FILE_SIZE =
100 * 1024 * 1024; // 100 MB

pdfInput.addEventListener(
    "change",
    (e) => {

        const file =
        e.target.files[0];

        if (!file)
            return;

        if (
            file.size >
            MAX_FILE_SIZE
        ) {

            alert(
                "Maximum allowed file size is 100 MB"
            );

            pdfInput.value = "";

            fileInfo.innerHTML = "";

            selectedFile = null;

            return;
        }

        selectedFile = file;

        const fileSizeMB =
        (
            file.size /
            (1024 * 1024)
        ).toFixed(2);

        fileInfo.innerHTML = `
            <div class="file-item">
                <div class="file-left">

                    <div class="file-icon">
                        <i class="fa-solid fa-file-pdf"></i>
                    </div>

                    <div class="file-info">
                        <h3>${file.name}</h3>
                        <p>${fileSizeMB} MB</p>
                    </div>

                </div>
            </div>
        `;
    }
);
// pdfInput.addEventListener(
//     "change",
//     (e) => {

//         selectedFile =
//         e.target.files[0];

//         if (!selectedFile)
//             return;

//         fileInfo.innerHTML = `
//         <div class="file-item">
//             ${selectedFile.name}
//         </div>
//         `;
//     }
// );

/* =====================
   PROTECT PDF
===================== */

protectBtn.addEventListener(
    "click",
    async () => {

        if (!selectedFile) {

            alert(
                "Select PDF File"
            );

            return;
        }

        if (
            password.value.trim() === ""
        ) {

            alert(
                "Enter Password"
            );

            return;
        }

        if (
            password.value !==
            confirmPassword.value
        ) {

            alert(
                "Passwords do not match"
            );

            return;
        }

        loader.classList.remove(
            "hidden"
        );

        try {

            const formData =
            new FormData();

            formData.append(
                "pdf",
                selectedFile
            );

            formData.append(
                "password",
                password.value
            );

            const response =
            await fetch(
                "https://vibrant-alignment.up.railway.app/protect",
                {
                    method:"POST",
                    body:formData
                }
            );

            if (!response.ok) {

                throw new Error(
                    "Failed"
                );

            }

            const blob =
            await response.blob();

            const url =
            URL.createObjectURL(
                blob
            );

            const a =
            document.createElement(
                "a"
            );

            a.href = url;

            a.download =
            "protected.pdf";

            a.click();

            URL.revokeObjectURL(
                url
            );

        }
        catch {

            alert(
                "Failed to protect PDF"
            );

        }

        loader.classList.add(
            "hidden"
        );

    }
);