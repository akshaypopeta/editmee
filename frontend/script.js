const tools = [

  {
    title: "Merge PDF",
    description: "Combine PDFs in the order you want with the easiest PDF merger available.",
    icon: "fa-solid fa-code-merge",
    color: "red",
    link: "tools/merge-pdf/index.html"
  },

  {
    title: "Split PDF",
    description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: "fa-solid fa-scissors",
    color: "orange",
    link: "tools/split-pdf/index.html"
  },

 {
    title: "PDF to JPG",
    description: "Convert each PDF page into JPG or extract images from PDFs.",
    icon: "fa-solid fa-image",
    color: "yellow",
  link: "tools/pdf-jpg/index.html"
  },

  {
    title: "JPG to PDF",
    description: "Convert JPG images into PDF in seconds.",
    icon: "fa-solid fa-file-image",
    color: "yellow",
    link: "tools/jpg-pdf/index.html"
  },

  {
    title: "Sign PDF",
    description: "Sign yourself or request electronic signatures from others.",
    icon: "fa-solid fa-signature",
    color: "blue",
    link: "tools/signed-pdf/index.html"
  },

  {
    title: "Watermark",
    description: "Stamp an image or text over your PDF in seconds.",
    icon: "fa-solid fa-stamp",
    color: "purple",
    link: "tools/watermark-pdf/index.html"
  },

  {
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them.",
    icon: "fa-solid fa-rotate",
    color: "purple",
  link: "tools/rotate-pdf/index.html"
  },

  {
    title: "Protect PDF",
    description: "Protect PDF files with a password and encryption.",
    icon: "fa-solid fa-lock",
    color: "blue",
  link: "tools/protect-pdf/index.html"
  },

  {
    title: "Delete PDF Pages",
    description: "Remove unwanted pages from your PDF instantly.",
    icon: "fa-solid fa-trash",
    color: "red",
  link: "tools/delete-pdf/index.html"
  },

 {
  title: "Extract PDF Pages",
  description: "Extract and keep only selected pages from your PDF instantly.",
  icon: "fa-solid fa-file-export",
  color: "green",
  link: "tools/extract-pdf/index.html"
},

{
  title: "Page Numbers",
  description: "Add page numbers to your PDF documents instantly.",
  icon: "fa-solid fa-list-ol",
  color: "orange",
  link: "tools/pagenumber-pdf/index.html"
},

{
  title: "Image Compressor",
  description: "Reduce the file size of your images without losing quality.",
  icon: "fa-solid fa-compress",
  color: "green",
  link: "tools/image_compressor/index.html"
}

  // ,{
  //   title: "Compress PDF",
  //   description: "Reduce file size while optimizing for maximal PDF quality.",
  //   icon: "fa-solid fa-file-zipper",
  //   color: "green",
  //   link: "tools/coming-soon/index.html"
  // },

  // {
  //   title: "PDF to Word",
  //   description: "Convert your PDF files into editable DOC and DOCX documents.",
  //   icon: "fa-solid fa-file-word",
  //   color: "blue",
  //   link: "tools/coming-soon/index.html"
  // },

  // {
  //   title: "PDF to PowerPoint",
  //   description: "Turn your PDF files into editable PPT and PPTX slideshows.",
  //   icon: "fa-solid fa-file-powerpoint",
  //   color: "orange",
  //   link: "tools/coming-soon/index.html"
  // },

  // {
  //   title: "PDF to Excel",
  //   description: "Pull data straight from PDFs into Excel spreadsheets.",
  //   icon: "fa-solid fa-file-excel",
  //   color: "green",
  //   link: "tools/coming-soon/index.html"
  // },

  // {
  //   title: "Word to PDF",
  //   description: "Make DOC and DOCX files easy to read by converting them to PDF.",
  //   icon: "fa-solid fa-file-word",
  //   color: "blue",
  //   link: "tools/coming-soon/index.html"
  // },

  // {
  //   title: "PowerPoint to PDF",
  //   description: "Convert PPT and PPTX slideshows to PDF.",
  //   icon: "fa-solid fa-file-powerpoint",
  //   color: "orange",
  //   link: "tools/coming-soon/index.html"
  // },

  // {
  //   title: "Excel to PDF",
  //   description: "Convert Excel spreadsheets to PDF documents.",
  //   icon: "fa-solid fa-file-excel",
  //   color: "green",
  //   link: "tools/coming-soon/index.html"
  // },

  // {
  //   title: "Edit PDF",
  //   description: "Add text, images, shapes or annotations to your PDF document.",
  //   icon: "fa-solid fa-pen-to-square",
  //   color: "purple",
  //   link: "tools/coming-soon/index.html"
  // },

  // {
  //   title: "HTML to PDF",
  //   description: "Convert webpages in HTML to PDF easily.",
  //   icon: "fa-solid fa-globe",
  //   color: "yellow",
  //   link: "tools/coming-soon/index.html"
  // },

  // {
  //   title: "Unlock PDF",
  //   description: "Remove PDF password security from your files.",
  //   icon: "fa-solid fa-unlock",
  //   color: "blue",
  //   link: "tools/coming-soon/index.html"
  // }
];



const toolsGrid = document.getElementById("toolsGrid");

function renderTools() {

  toolsGrid.innerHTML = "";

  tools.forEach((tool) => {

    const toolCard = document.createElement("div");

    toolCard.classList.add("tool-card");

    toolCard.innerHTML = `

      <div class="tool-top">

        <div class="tool-icon ${tool.color}">
          <i class="${tool.icon}"></i>
        </div>

      </div>

      <h3>${tool.title}</h3>

      <p>${tool.description}</p>

    `;

    toolCard.addEventListener("click", () => {

  window.location.href = tool.link;

});

    toolsGrid.appendChild(toolCard);

  });

}

renderTools();

const hamburgerBtn =
document.getElementById("hamburgerBtn");

const mobileMenu =
document.getElementById("mobileMenu");

hamburgerBtn.addEventListener("click", () => {

    mobileMenu.classList.toggle("show");

});

window.addEventListener("resize", () => {

    if (window.innerWidth > 992) {

        mobileMenu.classList.remove("show");

    }

});

document.querySelectorAll(".mobile-menu a").forEach(link => {

    link.addEventListener("click", () => {

        mobileMenu.classList.remove("show");

    });

});