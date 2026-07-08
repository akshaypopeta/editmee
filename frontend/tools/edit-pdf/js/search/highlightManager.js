/**
 * ============================================================================
 * EditMee PDF Editor
 * Highlight Manager
 * ============================================================================
 */

export default class HighlightManager {

    constructor(renderer) {

        this.renderer = renderer;

        // Page Number -> Highlight Data
        this.pageHighlights = new Map();

        // Current search result
        this.currentResult = null;

    }

    /**
     * Store highlights for a page.
     */
    setPageHighlights(pageNumber, highlights) {

        this.pageHighlights.set(pageNumber, highlights);

    }

    /**
     * Get highlights for a page.
     */
    getPageHighlights(pageNumber) {

        return this.pageHighlights.get(pageNumber) || [];

    }

    /**
     * Remove all stored highlights.
     */
    clear() {

        this.pageHighlights.clear();

        this.currentResult = null;

    }

    /**
     * Set current active search result.
     */
    setCurrentResult(result) {

        this.currentResult = result;

    }

    /**
 * Temporary test highlight.
 */
drawTestHighlight(pageNumber) {

    console.log("drawTestHighlight called");

    const pageState = this.renderer.pageManager.getPage(pageNumber);

    console.log(pageState);

    const layer = pageState.highlightLayer;

    console.log(layer);

    layer.innerHTML = "";

    const box = document.createElement("div");

    box.style.position = "absolute";
    box.style.left = "100px";
    box.style.top = "100px";
    box.style.width = "120px";
    box.style.height = "30px";
    box.style.background = "red";

    layer.appendChild(box);

    console.log(layer.innerHTML);

}

}