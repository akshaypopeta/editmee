const pdfInput =
document.getElementById("pdfInput");

const fileName =
document.getElementById("fileName");

const convertBtn =
document.getElementById("convertBtn");

const status =
document.getElementById("status");

pdfInput.addEventListener("change", () => {

    if(pdfInput.files.length > 0){

        fileName.textContent =
        pdfInput.files[0].name;
    }
});

convertBtn.addEventListener("click", async () => {

    const file =
    pdfInput.files[0];

    if(!file){

        alert("Please select a PDF");
        return;
    }

    const formData =
    new FormData();

    formData.append("pdf", file);

    status.textContent =
    "Converting...";

    try{

        const response =
        await fetch("/convert-pdf-word",{
            method:"POST",
            body:formData
        });

        if(!response.ok){

            throw new Error();
        }

        const blob =
        await response.blob();

        const url =
        window.URL.createObjectURL(blob);

        const a =
        document.createElement("a");

        a.href = url;
        a.download = "converted.docx";

        document.body.appendChild(a);
        a.click();
        a.remove();

        status.textContent =
        "Conversion Completed";

    }
    catch(error){

        console.error(error);

        status.textContent =
        "Conversion Failed";
    }

});