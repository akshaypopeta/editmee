document.addEventListener("DOMContentLoaded", () => {

    const scrollBtn = document.getElementById("scrollBtn");

    if (!scrollBtn) return;

    let hideTimer;

    function showButton() {

        if (window.scrollY < 300) {
            scrollBtn.classList.remove("show");
            return;
        }

        scrollBtn.classList.add("show");

        clearTimeout(hideTimer);

        hideTimer = setTimeout(() => {
            scrollBtn.classList.remove("show");
        }, 2000);
    }

    window.addEventListener("scroll", showButton);
    document.addEventListener("mousemove", showButton);
    document.addEventListener("touchstart", showButton);

    scrollBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

});