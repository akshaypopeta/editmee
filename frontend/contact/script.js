const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

emailjs.init("YOUR_PUBLIC_KEY");

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
    .then((res) => {
        console.log("SUCCESS", res);
        formMessage.innerHTML = "✅ Message sent successfully!";
        contactForm.reset();
    })
    .catch((err) => {
        console.error("ERROR", err);
        formMessage.innerHTML = "❌ Failed to send message.";
    });
});