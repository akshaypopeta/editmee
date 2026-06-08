const convertTools = [

// {
//     title:"PDF to Word",
//     description:"Convert PDF documents into editable Word files.",
//     icon:"fa-solid fa-file-word",
//     color:"blue",
//     cardColor:"card-blue",
//     link:"../coming-soon/index.html"
// },

// {
//     title:"Word to PDF",
//     description:"Convert DOCX files into PDF documents.",
//     icon:"fa-solid fa-file-word",
//     color:"blue",
//     cardColor:"card-blue",
//     link:"../coming-soon/index.html"
// },

{
    title:"PDF to JPG",
    description:"Convert PDF pages into JPG images.",
    icon:"fa-solid fa-file-image",
    color:"yellow",
    cardColor:"card-yellow",
    link:"../pdf-jpg/index.html"
},

{
    title:"JPG to PDF",
    description:"Convert JPG images into PDF files.",
    icon:"fa-solid fa-file-image",
    color:"yellow",
    cardColor:"card-yellow",
    link:"../jpg-pdf/index.html"
}

// ,{
//     title:"PDF to Excel",
//     description:"Extract PDF tables into editable Excel sheets.",
//     icon:"fa-solid fa-file-excel",
//     color:"green",
//     cardColor:"card-green",
//     link:"../coming-soon/index.html"
// },

// {
//     title:"Excel to PDF",
//     description:"Convert Excel spreadsheets into PDF documents.",
//     icon:"fa-solid fa-file-excel",
//     color:"green",
//     cardColor:"card-green",
//     link:"../coming-soon/index.html"
// },

// {
//     title:"PDF to PowerPoint",
//     description:"Convert PDF files into PPT presentations.",
//     icon:"fa-solid fa-file-powerpoint",
//     color:"orange",
//     cardColor:"card-orange",
//     link:"../coming-soon/index.html"
// },

// {
//     title:"PowerPoint to PDF",
//     description:"Convert PowerPoint presentations into PDFs.",
//     icon:"fa-solid fa-file-powerpoint",
//     color:"orange",
//     cardColor:"card-orange",
//     link:"../coming-soon/index.html"
// },

// {
//     title:"PDF to Text",
//     description:"Extract text content from PDF documents.",
//     icon:"fa-solid fa-file-lines",
//     color:"blue",
//     cardColor:"card-blue",
//     link:"../coming-soon/index.html"
// },

// {
//     title:"Text to PDF",
//     description:"Convert text files into PDF documents.",
//     icon:"fa-solid fa-file-lines",
//     color:"blue",
//     cardColor:"card-blue",
//     link:"../coming-soon/index.html"
// },

// {
//     title:"PDF to HTML",
//     description:"Convert PDF documents into HTML pages.",
//     icon:"fa-solid fa-code",
//     color:"green",
//     cardColor:"card-green",
//     link:"../coming-soon/index.html"
// },

// {
//     title:"HTML to PDF",
//     description:"Convert HTML pages into PDF documents.",
//     icon:"fa-solid fa-code",
//     color:"green",
//     cardColor:"card-green",
//     link:"../coming-soon/index.html"
// }

];

const toolsGrid = document.getElementById("toolsGrid");

convertTools.forEach(tool => {

    const card = document.createElement("div");

    card.className = `tool-card ${tool.cardColor}`;

    card.innerHTML = `

        <div class="tool-icon ${tool.color}">
            <i class="${tool.icon}"></i>
        </div>

        <h3>${tool.title}</h3>

        <p>${tool.description}</p>

    `;

    card.addEventListener("click", () => {
        window.location.href = tool.link;
    });

    toolsGrid.appendChild(card);

});