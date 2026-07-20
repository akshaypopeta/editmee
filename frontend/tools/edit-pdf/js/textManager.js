/* ==========================================================
   EDITMEE
   FILE : textManager.js
   PURPOSE :
   Manages PDF text extraction and caching.
   This class does not render anything and has no UI logic.
==========================================================*/

export default class TextManager {

    constructor(pdfDocument) {

        this.pdfDocument = pdfDocument;

        // Cache extracted text by page number
        this.textCache = new Map();

    }

    async getPageText(pageNumber) {

        // Return cached data if available
        if (this.textCache.has(pageNumber)) {

            return this.textCache.get(pageNumber);

        }

        // Load PDF page
        const page = await this.pdfDocument.getPage(pageNumber);

        // Extract text
        const textContent = await page.getTextContent();

        // Combine all text into a single searchable string
        const fullText = textContent.items
            .map(item => item.str)
            .join(" ");

        const pageText = {

            items: textContent.items,

            fullText

        };

        // Cache result
        this.textCache.set(pageNumber, pageText);

        return pageText;

    }

    /**
 * Get PDF.js page object.
 */
async getPage(pageNumber) {

    return await this.pdfDocument.getPage(pageNumber);

}

    
}