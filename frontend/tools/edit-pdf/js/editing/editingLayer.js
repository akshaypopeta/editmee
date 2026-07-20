/**
 * ============================================================================
 * EditMee PDF Editor
 * Editing Layer
 * ============================================================================
 */

export default class EditingLayer {
    constructor(pageManager) {
        this.pageManager = pageManager;
        this.currentBlock = null;
    }

    initializePage(pageNumber) {
        const pageState = this.pageManager.getPage(pageNumber);
        if (!pageState) return;
        if (pageState.editingLayer) return;

        const layer = document.createElement("div");
        layer.className = "editing-layer";
        layer.style.position = "absolute";
        layer.style.left = "0";
        layer.style.top = "0";
        layer.style.width = "100%";
        layer.style.height = "100%";
        layer.style.pointerEvents = "none";
        layer.style.zIndex = "30";

        pageState.container.appendChild(layer);
        pageState.editingLayer = layer;
    }

    getLayer(pageNumber) {
        const pageState = this.pageManager.getPage(pageNumber);
        if (!pageState) return null;
        return pageState.editingLayer;
    }

   // editingLayer.js

// editingLayer.js

createEditingBlock(pageNumber, object, bounds, viewport) {
  const layer = this.getLayer(pageNumber);
  if (!layer) return null;

  // Remove any previous editing block
  this.removeEditingBlock();

  // Mark object as editing and hide the original text immediately
  object.editing = true;
  object.visible = false;

  const dpr = window.devicePixelRatio || 1;
  const pageScale = viewport.scale || 1;

  // Convert device-pixel bounds to CSS pixels for DOM placement
  const cssLeft = bounds.left / dpr;
  const cssTop = bounds.top / dpr;
  const cssWidth = bounds.width / dpr;
  const cssHeight = bounds.height / dpr;

  const block = document.createElement("div");
  block.className = "editing-block";
  block.contentEditable = "true";
  block.spellcheck = false;
  block.textContent = object.text || "";

  // Positioning in CSS pixels
  block.style.position = "absolute";
  block.style.left = cssLeft + "px";
  block.style.top = cssTop + "px";
  block.style.width = cssWidth + "px";
  block.style.minHeight = cssHeight + "px";
  block.style.pointerEvents = "auto";
  block.style.whiteSpace = "pre-wrap";
  block.style.outline = "none";
  block.style.background = "transparent";
  block.style.zIndex = "100";

  // Compute CSS font-size so it visually matches the PDF text
  const cssFontSize = (object.height * pageScale) / dpr;
  block.style.fontFamily = (object.font && object.font.family) ? object.font.family : "sans-serif";
  block.style.fontSize = Math.max(10, Math.round(cssFontSize)) + "px";
  block.style.lineHeight = "1.15";

  layer.appendChild(block);

  // Focus and place caret at end
  block.focus();
  const range = document.createRange();
  range.selectNodeContents(block);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  // Commit changes immediately on blur or Ctrl+Enter
  const commit = () => {
    object.text = block.textContent;
    object.edited = true;
    object.editing = false;
    object.visible = false; // keep old text hidden

    // Optional: recompute width for hit-testing
    const ctx = viewport.context || pageState?.context;
    if (ctx) {
      ctx.font = `${object.height * viewport.scale}px sans-serif`;
      const textWidthPx = ctx.measureText(object.text).width;
      object.width = textWidthPx / viewport.scale; // back to PDF units
    }

    this.removeEditingBlock();

    // 🔑 Force redraw immediately so changes appear without zoom
    if (window.renderer && typeof window.renderer.redrawPage === "function") {
      window.renderer.redrawPage(pageNumber);
    }
  };

  const cancel = () => {
    object.editing = false;
    this.removeEditingBlock();
    if (window.renderer && typeof window.renderer.redrawPage === "function") {
      window.renderer.redrawPage(pageNumber);
    }
  };

  block.addEventListener("blur", () => {
    setTimeout(() => {
      if (this.currentBlock === block) commit();
    }, 0);
  });

  block.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      ev.preventDefault();
      cancel();
    } else if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
      ev.preventDefault();
      commit();
    }
  });

  block._editme_cleanup = () => {
    block.removeEventListener("blur", commit);
    block.removeEventListener("keydown", cancel);
  };

  this.currentBlock = block;
  return block;
}




  removeEditingBlock() {
  if (!this.currentBlock) return;
  // cleanup listeners if stored
  if (this.currentBlock._editme_cleanup) {
    try { this.currentBlock._editme_cleanup(); } catch (e) {}
  }
  this.currentBlock.remove();
  this.currentBlock = null;
}


    getEditingBlock() {
        return this.currentBlock;
    }

    getText() {
        if (!this.currentBlock) return "";
        return this.currentBlock.textContent;
    }

    // Sync with zoom/scroll
    syncWithViewport(pageNumber, viewport) {
        const layer = this.getLayer(pageNumber);
        if (!layer) return;
        layer.style.transform = `scale(${viewport.scale})`;
        layer.style.transformOrigin = "0 0";
    }
}
