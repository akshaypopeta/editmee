/* ==========================================================
   EDITMEE
   FILE : objects/textExtractor.js
   PURPOSE :
   Extract all editable text objects from a PDF page.
==========================================================*/

export default class TextExtractor {

    constructor(pageManager, objectManager) {

        this.pageManager = pageManager;
        this.objectManager = objectManager;

    }

    /**
     * Extract all text objects from one page.
     */
    async extractPage(pageNumber) {

        const pageState = this.pageManager.getPage(pageNumber);

        if (!pageState || !pageState.pdfPage) {

            throw new Error(`Page ${pageNumber} is not loaded.`);

        }

        const pdfPage = pageState.pdfPage;

        const textContent = await pdfPage.getTextContent();

        const objects = [];

        let id = 1;

        for (const item of textContent.items) {

            objects.push({

                id: id++,

                type: "text",

                page: pageNumber,

                text: item.str,

                transform: item.transform,

                width: item.width,

                height: item.height,

                fontName: item.fontName,

                hasEOL: item.hasEOL

            });

        }

        this.objectManager.setPageObjects(
            pageNumber,
            objects
        );

        return objects;

    }

    /**
     * Extract every page.
     */
    async extractDocument() {

        const totalPages = this.pageManager.getPageCount();

        for (let page = 1; page <= totalPages; page++) {

            await this.extractPage(page);

        }

    }

}