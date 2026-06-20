const contactForm =
document.getElementById("contactForm");

const formMessage =
document.getElementById("formMessage");

contactForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const name =
    document.getElementById("name").value;

    const email =
    document.getElementById("email").value;

    const subject =
    document.getElementById("subject").value;

    const message =
    document.getElementById("message").value;

    const body =
`Name: ${name}

Email: ${email}

Message:
${message}`;

    window.location.href =
`mailto:support@editmee.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    formMessage.innerHTML =
    "Your email application has been opened.";

    contactForm.reset();

});