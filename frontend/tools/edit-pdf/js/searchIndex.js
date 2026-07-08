/* ==========================================================
   EDITMEE
   FILE : searchIndex.js

   PURPOSE

   Builds and maintains the searchable text index.

   Responsibilities

   • Lazy page indexing
   • Cache indexed pages
   • Prevent duplicate indexing
   • Background indexing support

==========================================================*/

export default class SearchIndex {

    constructor(textManager) {

        this.textManager = textManager;

        // pageNumber -> normalized searchable text
        this.pageIndex = new Map();

        // Prevent duplicate indexing
        this.indexingPages = new Set();

    }

    /**
     * Returns true if page already indexed.
     */
    isIndexed(pageNumber) {

        return this.pageIndex.has(pageNumber);

    }

    /**
     * Returns indexed text.
     */
    getIndexedText(pageNumber) {

        return this.pageIndex.get(pageNumber) || "";

    }

    /**
 * Builds the search index for a single page.
 */
async indexPage(pageNumber) {

    // Already indexed
    if (this.isIndexed(pageNumber)) {
        return this.getIndexedText(pageNumber);
    }

    // Prevent duplicate indexing
    if (this.indexingPages.has(pageNumber)) {
        return null;
    }

    this.indexingPages.add(pageNumber);

    try {

       // Get page text object
const pageText = await this.textManager.getPageText(pageNumber);

// Normalize searchable text
const normalizedText = pageText.fullText
    .replace(/\s+/g, " ")
    .trim();

        // Store in cache
        this.pageIndex.set(pageNumber, normalizedText);

        return normalizedText;

    } finally {

        this.indexingPages.delete(pageNumber);

    }

}

/**
 * Searches for a query within a single page.
 */
async searchInPage(pageNumber, query) {

    if (!query) {
        return [];
    }

    // Ensure the page is indexed
    const pageText = await this.indexPage(pageNumber);

    if (!pageText) {
        return [];
    }

    const searchText = pageText.toLowerCase();
    const searchQuery = query.toLowerCase();

    const matches = [];

    let startIndex = 0;

    while (true) {

        const matchIndex = searchText.indexOf(searchQuery, startIndex);

        if (matchIndex === -1) {
            break;
        }

       const previewStart = Math.max(0, matchIndex - 30);

const previewEnd = Math.min(
    pageText.length,
    matchIndex + searchQuery.length + 30
);

const preview = pageText
    .substring(previewStart, previewEnd)
    .trim();

matches.push({

    pageNumber,

    index: matchIndex,

    length: searchQuery.length,

    query,

    preview

});

        startIndex = matchIndex + searchQuery.length;

    }

    return matches;

}

/**
 * Searches the entire document.
 */
async searchDocument(query) {

    if (!query) {
        return [];
    }

    const results = [];

    const totalPages = this.textManager.pdfDocument.numPages;

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {

        const pageMatches = await this.searchInPage(pageNumber, query);

        if (pageMatches.length) {
            results.push(...pageMatches);
        }

    }

    return results;

}

}