const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

emailjs.init("4nakclJfDNwWv_eT_");

contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    const params = {
        name: name,
        email: email,
        subject: subject,
        message: message
    };

    emailjs.send(
        "service_v76pyop",
        "template_pe453kv",
        params
    )
    .then(() => {
        formMessage.innerHTML = "✅ Message sent successfully!";
        contactForm.reset();
    })
    .catch((error) => {
        console.error(error);
        formMessage.innerHTML = "❌ Failed to send message.";
    });
});