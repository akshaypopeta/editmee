import { getObjectBounds } from "../utils/objectBounds.js";

export default class EditedTextLayer {

    constructor(pageManager) {

        this.pageManager = pageManager;

        this.layers = new Map();

    }

    initializePage(pageNumber) {

        if (this.layers.has(pageNumber)) {
            return;
        }

        const pageState = this.pageManager.getPage(pageNumber);

        const layer = document.createElement("div");

        layer.className = "edited-text-layer";

        layer.style.position = "absolute";
        layer.style.left = "0";
        layer.style.top = "0";
        layer.style.right = "0";
        layer.style.bottom = "0";

        layer.style.pointerEvents = "none";

        pageState.container.appendChild(layer);

        this.layers.set(pageNumber, layer);

    }

    clear(pageNumber) {

        const layer = this.layers.get(pageNumber);

        if (layer) {

            layer.innerHTML = "";

        }

    }

  render(pageNumber, blocks, viewport) {

    this.initializePage(pageNumber);

    const layer = this.layers.get(pageNumber);

    layer.innerHTML = "";

    for (const block of blocks) {

        if (!block.edited) continue;

        const div = document.createElement("div");

        div.style.position = "absolute";

        const bounds =
    getObjectBounds(
        block,
        viewport
    );

div.style.left =
    bounds.left + "px";

div.style.top =
    bounds.top + "px";

div.style.width =
    bounds.width + "px";

div.style.minHeight =
    bounds.height + "px";

        div.style.whiteSpace = "pre-wrap";

        div.style.wordBreak = "break-word";

        div.style.fontFamily =
    block.fontFamily || "Arial";

div.style.fontSize =
    (block.fontSize || block.height) *
    viewport.scale + "px";

div.style.fontWeight =
    block.fontWeight || "normal";

div.style.fontStyle =
    block.fontStyle || "normal";

div.style.color =
    block.color || "#000";

        div.style.color = "#000";

        div.style.background = "transparent";

        div.textContent = block.text;

        layer.appendChild(div);

        div.style.transformOrigin = "top left";
div.style.padding = "0";
div.style.margin = "0";

    }

}

}