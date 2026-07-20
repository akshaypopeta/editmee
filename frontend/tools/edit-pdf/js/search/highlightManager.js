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

/**
 * Get text items and PDF page for highlighting.
 */
async getTextItems(pageNumber) {

    const textManager = this.renderer.textManager;

    const page = await textManager.getPage(pageNumber);

    const pageText = await textManager.getPageText(pageNumber);

    return {

        page,

        items: pageText.items

    };

}

/**
 * Get current viewport for a page.
 */
getViewport(page) {

    return page.getViewport({

        scale: this.renderer.getZoom()

    });

}

/**
 * Find text items matching the search query.
 */
async findMatches(pageNumber, query) {

    const { items } = await this.getTextItems(pageNumber);

    const matches = [];

    const search = query.toLowerCase();

    items.forEach(item => {

        if (!item.str) return;

        if (item.str.toLowerCase().includes(search)) {

            matches.push(item);

        }

    });

    return matches;

}

/**
 * Calculate the horizontal bounds of a match inside a text item.
 */
calculateMatchBounds(item, query) {

    const text = item.str;

    const start = text.toLowerCase().indexOf(query.toLowerCase());

    if (start === -1) {

        return null;

    }

    const beforeText = text.substring(0, start);

    const matchText = text.substring(start, start + query.length);

    // Approximate character width
    const charWidth = item.width / text.length;

    return {

        offsetX: beforeText.length * charWidth,

        width: matchText.length * charWidth

    };

}

async inspectMatches(pageNumber, query) {

    const matches = await this.findMatches(pageNumber, query);

    console.log(matches);

}



/**
 * Create highlight model from a text item.
 */

/**
 * Create highlight model from a text item.
 */
createHighlightModel(item, viewport, query) {

    const bounds = this.calculateMatchBounds(item, query);

    if (!bounds) {

        return null;

    }

    return {

        left:
            (item.transform[4] * viewport.scale) +
            bounds.offsetX,

        top:
    viewport.height -
    (item.transform[5] * viewport.scale) -
    (item.height * viewport.scale),

        width: bounds.width,

        height: item.height * viewport.scale,

        text: item.str

    };

}

renderHighlight(layer, model) {

    const highlight = document.createElement("div");

    highlight.className = "search-highlight";

    highlight.style.position = "absolute";
    highlight.style.left = model.left + "px";
    highlight.style.top = model.top + "px";
    highlight.style.width = model.width + "px";
    highlight.style.height = model.height + "px";

    layer.appendChild(highlight);

}

async showHighlights(pageNumber, query) {

    const pageState = this.renderer.pageManager.getPage(pageNumber);

    if (!pageState || !pageState.highlightLayer) {
        return;
    }

    const layer = pageState.highlightLayer;

layer.innerHTML = "";

const viewport = pageState.viewport;

  const matches = await this.findMatches(pageNumber, query);

    for (const item of matches) {

       const model = this.createHighlightModel(
    item,
    viewport,
    query
);

if (model) {

    this.renderHighlight(layer, model);

}

    }

}

clearPageHighlights() {

    this.renderer.pageManager.pages.forEach(pageState => {

        if (pageState.highlightLayer) {

            pageState.highlightLayer.innerHTML = "";

        }

    });

}

}