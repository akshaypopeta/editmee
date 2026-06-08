unlockBtn.addEventListener("click", async () => {

  if (!selectedFile) {
    alert("Select PDF first");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("password", passwordInput.value || "");

  loader.classList.remove("hidden");

  try {

    const res = await fetch("http://localhost:3000/unlock", {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Failed");

    const blob = await res.blob();

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "unlocked.pdf";
    a.click();

    URL.revokeObjectURL(url);

  } catch (err) {
    alert("❌ Wrong password or unlock failed");
  }

  loader.classList.add("hidden");
});